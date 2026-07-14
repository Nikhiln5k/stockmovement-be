import { Response } from "express";
import common from "./index";

export const successRes = (res: Response, data: any, message: string) => {
    res.status(common.success).json({
        status: common.success,
        message,
        data,
    });
}

export const createRes = (res: Response, data: any, message: string) => {
    res.status(common.created).json({
        status: common.created,
        message,
        data,
    });
}

export const errorRes = (res: Response) => {
    res.status(common.error).json({
        status: common.error,
        data: [],
        message: common.errorMsg,
    });
}

export const notFoundRes = (res: Response, data: any, message: string) => {
    res.status(common.notFound).json({
        status: common.notFound,
        message,
        data,
    });
}

export const badReqRes = (res: Response, data: any, message: string) => {
    res.status(common.badReq).json({
        status: common.badReq,
        message,
        data: data ?? [],
    });
}

export const unAuthRes = (res: Response, data: any, message: string) => {
    res.status(common.unAuth).json({
        status: common.unAuth,
        message,
        data,
    });
}

export const forbiddenRes = (res: Response, data: any, message: string) => {
    res.status(common.forbidden).json({
        status: common.forbidden,
        message,
        data,
    });
}