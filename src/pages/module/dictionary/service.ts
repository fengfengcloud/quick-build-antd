
import request, { syncRequest } from '@/utils/request';
import { serialize } from 'object-to-formdata';

export async function queryDicrionaryDefine(params: any) {
    return request(`/api/dictionary/getdictionary.do`, {
        method: 'POST',
        body: serialize(params),
    })
}

export async function queryDictionaryData(params: any) {
    params._dc = new Date().getTime();
    return request(`/api/dictionary/getDictionaryComboData.do`, {
        params
    })
}


export function querySyncDicrionaryDefine(params: any): any {
    return syncRequest(`/api/dictionary/getdictionary.do`, {
        params,
    })
}

export function querySyncDictionaryData(params: any): any {
    return syncRequest(`/api/dictionary/getDictionaryComboData.do`, {
        params
    })
}

export function querySyncPropertys(params: any): any {
    return syncRequest(`/api/dictionary/getPropertyComboData.do`, {
        params,
    })
}
