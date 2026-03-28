/**
 * INTERNAL API BRIDGE - TRƯỜNG KIM ĐỒNG
 * Mục đích: Cầu nối giao tiếp (Fetch API) giữa giao diện Web App và Google Apps Script.
 * Hệ thống quản trị công văn và lịch công tác nội bộ.
 * Phiên bản: An toàn hóa định danh V4
 */

// THẦY HÃY THAY ĐƯỜNG LINK DƯỚI ĐÂY BẰNG LINK WEB APP (đuôi /exec) CỦA THẦY:
const GAS_URL = "https://script.google.com/macros/s/AKfycbw8xUkYgACGzd7EUMNXtzLzL-Rb6aF_PH5zgZDnA67FVkyTKnuvNEzSs7iv7TxByloBmw/exec";

// Khởi tạo luồng xử lý độc lập cho từng yêu cầu giao tiếp an toàn
function createRunner(onSuccess, onFailure) {
    return {
        withSuccessHandler: function(cb) {
            return createRunner(cb, onFailure);
        },
        withFailureHandler: function(cb) {
            return createRunner(onSuccess, cb);
        },
        _call: function(funcName, args) {
            // Đính kèm Token/Định danh người dùng hiện tại để Google Apps Script xác thực quyền hạn
            const opCode = window.SCV_GLOBAL_OP_CODE || sessionStorage.getItem("APP_OPERATOR_CODE");
            args.push(opCode); 

            fetch(GAS_URL, {
                method: 'POST',
                headers: { "Content-Type": "text/plain;charset=utf-8" },
                body: JSON.stringify({ func: funcName, args: args })
            })
            .then(res => res.json())
            .then(res => {
                if (res.success) {
                    if (onSuccess) onSuccess(res.data);
                } else {
                    if (onFailure) onFailure(res.error);
                    else console.error("Lỗi từ máy chủ Google:", res.error);
                }
            })
            .catch(err => {
                if (onFailure) onFailure(err);
                else console.error("Lỗi mất kết nối:", err);
            });
        },
        // Danh sách các API tiêu chuẩn
        SCV_getInitialData: function() { this._call('SCV_getInitialData', []); },
        SCV_saveDataLich: function(a) { this._call('SCV_saveDataLich', [a]); },
        SCV_getDataLich: function(a) { this._call('SCV_getDataLich', [a]); },
        SCV_getDmCongVan: function() { this._call('SCV_getDmCongVan', []); },
        SCV_saveCongVan: function(a,b) { this._call('SCV_saveCongVan', [a,b]); },
        SCV_getDataCongVan: function(a) { this._call('SCV_getDataCongVan', [a]); },
        SCV_getSubFolders: function(a) { this._call('SCV_getSubFolders', [a]); },
        SCV_createNewFolder: function(a,b) { this._call('SCV_createNewFolder', [a,b]); },
        SCV_uploadMultipleFilesToDrive: function(a,b,c,d,e) { this._call('SCV_uploadMultipleFilesToDrive', [a,b,c,d,e]); },
        SCV_uploadFolderEvidence: function(a,b,c,d,e) { this._call('SCV_uploadFolderEvidence', [a,b,c,d,e]); }
    };
}

// Bắt buộc tạo mới Runner mỗi khi gọi google.script.run để tránh nghẽn luồng
const google = {
    script: {
        get run() {
            return createRunner(null, null);
        }
    }
};