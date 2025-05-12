// Hii file inabridges between TypeScript config na HTML/JS files
const getAppId = () => {
   
    const stored_app_id = window.localStorage.getItem('config.app_id');
    if (stored_app_id) {
        return stored_app_id;
    }

   
    return '71916';
};


window.DERIV_CONFIG = {
    getAppId
}; 