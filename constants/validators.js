
const isNullOrEmpty = async (value) => {
    console.log((value == undefined || value == null || value == ''));
    if(value == undefined || value == null || value == ''){
        return true;
    }else{
        return false;
    }
}

module.exports = {
    isNullOrEmpty 
}

