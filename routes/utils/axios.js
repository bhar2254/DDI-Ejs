/*	axios.js
	by Blaine Harper

	PURPOSE: MODULE SUseful functions and variables used for axios post/patch

module.exports
    axiosPatch
    axiosPost
*/

const axios = require('axios')

async function axiosPatch(url, data, options){
    const response = await axios.patch(url, data, options)
    return response.data
}

async function axiosPost(url, data, options){
    const response = await axios.post(url, data, options)
    return response.data
}

module.exports = {
    axiosPatch: axiosPatch,
    axiosPost: axiosPost,
}