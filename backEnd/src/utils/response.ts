import { Response } from "express";
// import { stat } from "fs"; // 'stat' tidak digunakan

export const successResponse = (
    res: Response,
    data : any,
    message = 'Berhasil',
    status = 200
) => {
    return res.status(status).json({
        success: true,
        message,
        data,
    });
};

export const errorResponse = (
    res : Response,
    message = 'Terjadi Kesalahan',
    status = 400
) => {
    return res.status(status).json({
        success : false,
        message,
    });
};