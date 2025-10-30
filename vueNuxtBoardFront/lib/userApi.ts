
import axiosApi from "~/lib/axiosApi";

const login = async (userId:string, password:string) => {

    const response = await axiosApi.post('/login', {
        userId,
        password,
    })
    return response.data;

}

export default login;