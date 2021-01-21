import React from 'react';
import { parse } from 'querystring';
import pathRegexp from 'path-to-regexp';
import { Route } from '@/models/connect';
import { message } from 'antd';

/* eslint no-useless-escape:0 import/prefer-default-export:0 */
const reg = /(((^https?:(?:\/\/)?)(?:[-;:&=\+\$,\w]+@)?[A-Za-z0-9.-]+(?::\d+)?|(?:www.|[-;:&=\+\$,\w]+@)[A-Za-z0-9.-]+)((?:\/[\+~%\/.\w-_]*)?\??(?:[-\+=&;%@.\w_]*)#?(?:[\w]*))?)$/;

export const isUrl = (path: string): boolean => reg.test(path);

export const isAntDesignPro = (): boolean => {
  if (ANT_DESIGN_PRO_ONLY_DO_NOT_USE_IN_YOUR_PRODUCTION === 'site') {
    return true;
  }
  return window.location.hostname === 'preview.pro.ant.design';
};

// 给官方演示站点用，用于关闭真实开发环境不需要使用的特性
export const isAntDesignProOrDev = (): boolean => {
  const { NODE_ENV } = process.env;
  if (NODE_ENV === 'development') {
    return true;
  }
  return isAntDesignPro();
};

export const getPageQuery = () => parse(window.location.href.split('?')[1]);

/**
 * props.route.routes
 * @param router [{}]
 * @param pathname string
 */
export const getAuthorityFromRouter = <T extends Route>(
  router: T[] = [],
  pathname: string,
): T | undefined => {
  const authority = router.find(
    ({ routes, path = '/' }) =>
      (path && pathRegexp(path).exec(pathname)) ||
      (routes && getAuthorityFromRouter(routes, pathname)),
  );
  if (authority) return authority;
  return undefined;
};

export const getRouteAuthority = (path: string, routeData: Route[]) => {
  let authorities: string[] | string | undefined;
  routeData.forEach((route) => {
    // match prefix
    if (pathRegexp(`${route.path}/(.*)`).test(`${path}/`)) {
      if (route.authority) {
        authorities = route.authority;
      }
      // exact match
      if (route.path === path) {
        authorities = route.authority || authorities;
      }
      // get children authority recursively
      if (route.routes) {
        authorities = getRouteAuthority(path, route.routes) || authorities;
      }
    }
  });
  return authorities;
};

// 把上传的按钮要隐藏掉 openFile 
export const PDFVIEWER = '/pdfjs-2.5.207-dist/web/viewer.html';

export const getPdfjsUrl = (url: string, filename: string) => {
  // 如果用浏览器内置pdf浏览器就返回 url
  // return url;
  return `${PDFVIEWER}?file=` + encodeURIComponent(url + `&saveName=${filename}`);
}

/**
* 简单的加密函数
*/
export const encryptString = (str: string): string => {
  if (!str) return '';
  let c = String.fromCharCode(str.charCodeAt(0) + str.length);
  for (let i = 1; i < str.length; i++) {
    c += String.fromCharCode(str.charCodeAt(i) + str.charCodeAt(i - 1));
  }
  return encodeURIComponent(c);
}

/**
* 简单的解密函数
*/
export const decryptString = (str: string): string => {
  if (!str) return '';
  str = decodeURIComponent(str);
  let c: string = String.fromCharCode(str.charCodeAt(0) - str.length);
  for (let i = 1; i < str.length; i++) {
    c += String.fromCharCode(str.charCodeAt(i) - c.charCodeAt(i - 1));
  }
  return c;
}

/**
 * 根据返回的结果显示信息
 * messages : {info : ['info1'], warn : [] , error : [] }
 * 
 * @param messages 
 */
export const showResultInfo = (messages: any) => {
  if (messages) {
    if (messages.info)
      (messages.info as string[]).forEach(mess => message.info(mess));
    if (messages.warn)
      (messages.warn as string[]).forEach(mess => message.warn(mess));
    if (messages.error)
      (messages.error as string[]).forEach(mess => message.error(mess));
  }
}

/**
 * 自动生成的label，只取最后的一节，项目合同--合同付款方式 ，返回 合同付款方式
 * @param label 
 */
export const getLastLevelLabel = (label: string): string => {
  if (label && label.indexOf('--') !== -1) {
    const parts: string[] = label.split('--');
    // console.log(parts);
    return parts[parts.length - 1];
  }
  return label;
}

/**
 * 通过form post 下载文件
 */
export const download = (url: string, params: Object) => {//导出表格
  const form = document.createElement('form');
  document.body.appendChild(form);
  for (let obj in params) {
    if (params.hasOwnProperty(obj)) {
      const input = document.createElement('input');
      input.type = 'hidden';
      input.name = obj;
      input.value = params[obj];
      form.appendChild(input);
    }
  }
  form.method = "POST";
  form.action = url;
  form.submit();
  document.body.removeChild(form);
}

export const apply = (dest: object, updated: object) => {
  if (dest instanceof Object && updated instanceof Object)
    for (let i in updated) {
      dest[i] = updated[i];
    }
  return dest;
}

export const applyIf = (dest: object, updated: object) => {
  if (dest instanceof Object && updated instanceof Object)
    for (let i in updated) {
      if (typeof dest[i] === 'undefined')
        dest[i] = updated[i];
    }
  return dest;
}

export const getFileExt = (filename: string): string => {
  if (!filename)
    return '';
  else {
    const temp = filename.split('').reverse().join('');
    return temp.substring(0, temp.search(/\./)).split('').reverse().join('').toLowerCase();
  }
}


export const applyAllOtherSetting = (object: any) => {
  if (Array.isArray(object)) {
    object.forEach((o: any) => applyAllOtherSetting(o));
  } else if (Object.prototype.toString.call(object) === '[object Object]') {
    for (let i in object) {
      if (i === 'othersetting') {
        applyOtherSetting(object, object[i]);
        //delete object[i];
        //console.log(object)
      } else {
        applyAllOtherSetting(object[i]);
      }
    }
  }
}


export const applyOtherSetting = (object: object, othersetting: string) => {
  if (othersetting) {
    //console.log('11111111111111111111111111111111----------');
    //console.log(object,othersetting);
    let ostr = {},
      s = '{' + othersetting + '}';
    try {
      ostr = eval("(" + s + ')');
    } catch (e) {
      alert("JSON解析错误：" + s);
    }
    if (ostr) {
      for (let i in ostr) {
        object[i] = ostr[i];
      }
    }
  }
}

// urlEncode
export const urlEncode = (param: any, key: any = null, encode: any = null) => {
  if (param == null) return '';
  let paramStr = '';
  const t = typeof (param);
  if (t == 'string' || t == 'number' || t == 'boolean') {
    paramStr += '&' + key + '=' + ((encode == null || encode) ? encodeURIComponent(param) : param);
  } else {
    for (let i in param) {
      const k = key == null ? i : key + (param instanceof Array ? '[' + i + ']' : '.' + i)
      paramStr += urlEncode(param[i], k, encode)
    }
  }
  return paramStr;
}


/**
* 根据传入的字符串，将最后面的数值加1,返回，如Ａ01,返回 A02
*/
export const getNextId = (aid: string) => {
  // 找到最后n位都是数值的字符串
  const length = aid.length;
  let pos = 0;
  for (let i = length - 1; i >= 0; i--) {
    if (aid[i] >= '0' && aid[i] <= '9') continue;
    else {
      pos = i + 1;
      break
    };
  }
  if (pos == length) return '';
  if (length - pos > 6) pos = length - 6;
  // 取得从i到length的字符串
  const str = aid.substr(pos);
  const num = parseInt(str) + 1;
  let newstr = '' + num;
  const addspace = str.length - newstr.length;
  for (let i = 0; i < addspace; i++) {
    newstr = '0' + newstr;
  }
  return (aid.substr(0, pos) + newstr);
}


/**
 * 取得菜单里的iconCls
 * @param iconCls 
 */
export const getMenuAwesomeIcon = (iconCls: string | undefined) => {
  return <span
    className="anticon"
    style={{ verticalAlign: 'middle' }}>
    <span
      className={iconCls ? iconCls : "fa fa-space"}
      style={{
        visibility: iconCls ? 'visible' : 'hidden'
      }} />
  </span>;
}

export const EMPTY_MENU_ICON = getMenuAwesomeIcon(undefined);

/**
 * 在新窗口中打开url指定的内容，一般是图片或附件的PDF预览文件
 * @param url 
 * @param title 
 * @param previewmode 
 */
export const onOpenInNewWindow = (url: string, title: string, previewmode: string) => {
  const basePath = window.location.origin;
  const url_ = basePath + url;
  const htmlMarkup = ['<!DOCTYPE html>', '<html>', '<head>',
    '<meta content="text/html; charset=UTF-8" http-equiv="Content-Type" />', '<title>' + title + '</title>',
    '<link rel="icon" href="' + basePath + '/favicon.png" type="image/x-icon" />',
    '<style type="text/css">html,body{height:100%;margin:0;text-align:center;}',
    'iframe{display: block;background: #fff;border:none;width:100%;height:100%;}',
    'img {width:auto;height:auto;max-width:100%;max-height:100%;}', '</style>', '</head>', '<body>',
    previewmode === 'image' ? '<img src="' + url_ + '"/>' : '<iframe src="' + url_ + '" ></iframe>',
    '</body>', '</html>'];
  const html = htmlMarkup.join(' ');
  //console.log(html)
  const win: any = window.open('');
  win.document.open();
  win.document.write(html);
  win.document.close();
}

export const isSafari = /Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent);

export const deleteSecond = (dateStr: string) => {
  if (!dateStr || dateStr.length <= 16)
    return dateStr;
  else
    return dateStr.substring(0, 16);
}

// 生成一个uuid
export function uuid() {
  const s: any[] = [];
  const hexDigits = "0123456789abcdef";
  for (let i = 0; i < 36; i++) {
    s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);
  }
  s[14] = "4";  // bits 12-15 of the time_hi_and_version field to 0010
  s[19] = hexDigits.substr((s[19] & 0x3) | 0x8, 1);  // bits 6-7 of the clock_seq_hi_and_reserved to 01
  s[8] = s[13] = s[18] = s[23] = "-";
  const uuid = s.join("");
  return uuid;
}

/**
 * MD5中文字符的和JAVA是一致的，用md5js不能解决中文加密的问题
 * @param string 
 */
export const MD5 = (string: string) => {
  function RotateLeft(lValue: any, iShiftBits: any) {
    return (lValue << iShiftBits) | (lValue >>> (32 - iShiftBits));
  }
  function AddUnsigned(lX: any, lY: any) {
    let lX4, lY4, lX8, lY8, lResult;
    lX8 = (lX & 0x80000000);
    lY8 = (lY & 0x80000000);
    lX4 = (lX & 0x40000000);
    lY4 = (lY & 0x40000000);
    lResult = (lX & 0x3FFFFFFF) + (lY & 0x3FFFFFFF);
    if (lX4 & lY4) { return (lResult ^ 0x80000000 ^ lX8 ^ lY8); }
    if (lX4 | lY4) {
      if (lResult & 0x40000000) {
        return (lResult ^ 0xC0000000 ^ lX8 ^ lY8);
      } else {
        return (lResult ^ 0x40000000 ^ lX8 ^ lY8);
      }
    } else {
      return (lResult ^ lX8 ^ lY8);
    }
  }
  function F(x: any, y: any, z: any) {
    return (x & y) | ((~x) & z);
  }
  function G(x: any, y: any, z: any) {
    return (x & z) | (y & (~z));
  }
  function H(x: any, y: any, z: any) {
    return (x ^ y ^ z);
  }
  function I(x: any, y: any, z: any) {
    return (y ^ (x | (~z)));
  }
  function FF(a: any, b: any, c: any, d: any, x: any, s: any, ac: any) {
    a = AddUnsigned(a, AddUnsigned(AddUnsigned(F(b, c, d), x), ac));
    return AddUnsigned(RotateLeft(a, s), b);
  };
  function GG(a: any, b: any, c: any, d: any, x: any, s: any, ac: any) {
    a = AddUnsigned(a, AddUnsigned(AddUnsigned(G(b, c, d), x), ac));
    return AddUnsigned(RotateLeft(a, s), b);
  };
  function HH(a: any, b: any, c: any, d: any, x: any, s: any, ac: any) {
    a = AddUnsigned(a, AddUnsigned(AddUnsigned(H(b, c, d), x), ac));
    return AddUnsigned(RotateLeft(a, s), b);
  };
  function II(a: any, b: any, c: any, d: any, x: any, s: any, ac: any) {
    a = AddUnsigned(a, AddUnsigned(AddUnsigned(I(b, c, d), x), ac));
    return AddUnsigned(RotateLeft(a, s), b);
  };
  function ConvertToWordArray(string: string) {
    let lWordCount;
    let lMessageLength = string.length;
    let lNumberOfWords_temp1 = lMessageLength + 8;
    let lNumberOfWords_temp2 = (lNumberOfWords_temp1 - (lNumberOfWords_temp1 % 64)) / 64;
    let lNumberOfWords = (lNumberOfWords_temp2 + 1) * 16;
    let lWordArray = Array(lNumberOfWords - 1);
    let lBytePosition = 0;
    let lByteCount = 0;
    while (lByteCount < lMessageLength) {
      lWordCount = (lByteCount - (lByteCount % 4)) / 4;
      lBytePosition = (lByteCount % 4) * 8;
      lWordArray[lWordCount] = (lWordArray[lWordCount] | (string.charCodeAt(lByteCount) << lBytePosition));
      lByteCount++;
    }
    lWordCount = (lByteCount - (lByteCount % 4)) / 4;
    lBytePosition = (lByteCount % 4) * 8;
    lWordArray[lWordCount] = lWordArray[lWordCount] | (0x80 << lBytePosition);
    lWordArray[lNumberOfWords - 2] = lMessageLength << 3;
    lWordArray[lNumberOfWords - 1] = lMessageLength >>> 29;
    return lWordArray;
  };
  function WordToHex(lValue: any) {
    let WordToHexValue = "",
      WordToHexValue_temp = "", lByte, lCount;
    for (lCount = 0; lCount <= 3; lCount++) {
      lByte = (lValue >>> (lCount * 8)) & 255;
      WordToHexValue_temp = "0" + lByte.toString(16);
      WordToHexValue = WordToHexValue + WordToHexValue_temp.substr(WordToHexValue_temp.length - 2, 2);
    }
    return WordToHexValue;
  };
  function Utf8Encode(string: any) {
    string = string.replace(/\r\n/g, "\n");
    let utftext = "";
    for (let n = 0; n < string.length; n++) {
      let c = string.charCodeAt(n);
      if (c < 128) {
        utftext += String.fromCharCode(c);
      } else if ((c > 127) && (c < 2048)) {
        utftext += String.fromCharCode((c >> 6) | 192);
        utftext += String.fromCharCode((c & 63) | 128);
      } else {
        utftext += String.fromCharCode((c >> 12) | 224);
        utftext += String.fromCharCode(((c >> 6) & 63) | 128);
        utftext += String.fromCharCode((c & 63) | 128);
      }
    }
    return utftext;
  };
  let x = Array();
  let k, AA, BB, CC, DD, a, b, c, d;
  let S11 = 7,
    S12 = 12,
    S13 = 17,
    S14 = 22;
  let S21 = 5,
    S22 = 9,
    S23 = 14,
    S24 = 20;
  let S31 = 4,
    S32 = 11,
    S33 = 16,
    S34 = 23;
  let S41 = 6,
    S42 = 10,
    S43 = 15,
    S44 = 21;
  string = Utf8Encode(string);
  x = ConvertToWordArray(string);
  a = 0x67452301;
  b = 0xEFCDAB89;
  c = 0x98BADCFE;
  d = 0x10325476;
  for (k = 0; k < x.length; k += 16) {
    AA = a;
    BB = b;
    CC = c;
    DD = d;
    a = FF(a, b, c, d, x[k + 0], S11, 0xD76AA478);
    d = FF(d, a, b, c, x[k + 1], S12, 0xE8C7B756);
    c = FF(c, d, a, b, x[k + 2], S13, 0x242070DB);
    b = FF(b, c, d, a, x[k + 3], S14, 0xC1BDCEEE);
    a = FF(a, b, c, d, x[k + 4], S11, 0xF57C0FAF);
    d = FF(d, a, b, c, x[k + 5], S12, 0x4787C62A);
    c = FF(c, d, a, b, x[k + 6], S13, 0xA8304613);
    b = FF(b, c, d, a, x[k + 7], S14, 0xFD469501);
    a = FF(a, b, c, d, x[k + 8], S11, 0x698098D8);
    d = FF(d, a, b, c, x[k + 9], S12, 0x8B44F7AF);
    c = FF(c, d, a, b, x[k + 10], S13, 0xFFFF5BB1);
    b = FF(b, c, d, a, x[k + 11], S14, 0x895CD7BE);
    a = FF(a, b, c, d, x[k + 12], S11, 0x6B901122);
    d = FF(d, a, b, c, x[k + 13], S12, 0xFD987193);
    c = FF(c, d, a, b, x[k + 14], S13, 0xA679438E);
    b = FF(b, c, d, a, x[k + 15], S14, 0x49B40821);
    a = GG(a, b, c, d, x[k + 1], S21, 0xF61E2562);
    d = GG(d, a, b, c, x[k + 6], S22, 0xC040B340);
    c = GG(c, d, a, b, x[k + 11], S23, 0x265E5A51);
    b = GG(b, c, d, a, x[k + 0], S24, 0xE9B6C7AA);
    a = GG(a, b, c, d, x[k + 5], S21, 0xD62F105D);
    d = GG(d, a, b, c, x[k + 10], S22, 0x2441453);
    c = GG(c, d, a, b, x[k + 15], S23, 0xD8A1E681);
    b = GG(b, c, d, a, x[k + 4], S24, 0xE7D3FBC8);
    a = GG(a, b, c, d, x[k + 9], S21, 0x21E1CDE6);
    d = GG(d, a, b, c, x[k + 14], S22, 0xC33707D6);
    c = GG(c, d, a, b, x[k + 3], S23, 0xF4D50D87);
    b = GG(b, c, d, a, x[k + 8], S24, 0x455A14ED);
    a = GG(a, b, c, d, x[k + 13], S21, 0xA9E3E905);
    d = GG(d, a, b, c, x[k + 2], S22, 0xFCEFA3F8);
    c = GG(c, d, a, b, x[k + 7], S23, 0x676F02D9);
    b = GG(b, c, d, a, x[k + 12], S24, 0x8D2A4C8A);
    a = HH(a, b, c, d, x[k + 5], S31, 0xFFFA3942);
    d = HH(d, a, b, c, x[k + 8], S32, 0x8771F681);
    c = HH(c, d, a, b, x[k + 11], S33, 0x6D9D6122);
    b = HH(b, c, d, a, x[k + 14], S34, 0xFDE5380C);
    a = HH(a, b, c, d, x[k + 1], S31, 0xA4BEEA44);
    d = HH(d, a, b, c, x[k + 4], S32, 0x4BDECFA9);
    c = HH(c, d, a, b, x[k + 7], S33, 0xF6BB4B60);
    b = HH(b, c, d, a, x[k + 10], S34, 0xBEBFBC70);
    a = HH(a, b, c, d, x[k + 13], S31, 0x289B7EC6);
    d = HH(d, a, b, c, x[k + 0], S32, 0xEAA127FA);
    c = HH(c, d, a, b, x[k + 3], S33, 0xD4EF3085);
    b = HH(b, c, d, a, x[k + 6], S34, 0x4881D05);
    a = HH(a, b, c, d, x[k + 9], S31, 0xD9D4D039);
    d = HH(d, a, b, c, x[k + 12], S32, 0xE6DB99E5);
    c = HH(c, d, a, b, x[k + 15], S33, 0x1FA27CF8);
    b = HH(b, c, d, a, x[k + 2], S34, 0xC4AC5665);
    a = II(a, b, c, d, x[k + 0], S41, 0xF4292244);
    d = II(d, a, b, c, x[k + 7], S42, 0x432AFF97);
    c = II(c, d, a, b, x[k + 14], S43, 0xAB9423A7);
    b = II(b, c, d, a, x[k + 5], S44, 0xFC93A039);
    a = II(a, b, c, d, x[k + 12], S41, 0x655B59C3);
    d = II(d, a, b, c, x[k + 3], S42, 0x8F0CCC92);
    c = II(c, d, a, b, x[k + 10], S43, 0xFFEFF47D);
    b = II(b, c, d, a, x[k + 1], S44, 0x85845DD1);
    a = II(a, b, c, d, x[k + 8], S41, 0x6FA87E4F);
    d = II(d, a, b, c, x[k + 15], S42, 0xFE2CE6E0);
    c = II(c, d, a, b, x[k + 6], S43, 0xA3014314);
    b = II(b, c, d, a, x[k + 13], S44, 0x4E0811A1);
    a = II(a, b, c, d, x[k + 4], S41, 0xF7537E82);
    d = II(d, a, b, c, x[k + 11], S42, 0xBD3AF235);
    c = II(c, d, a, b, x[k + 2], S43, 0x2AD7D2BB);
    b = II(b, c, d, a, x[k + 9], S44, 0xEB86D391);
    a = AddUnsigned(a, AA);
    b = AddUnsigned(b, BB);
    c = AddUnsigned(c, CC);
    d = AddUnsigned(d, DD);
  }
  const temp = WordToHex(a) + WordToHex(b) + WordToHex(c) + WordToHex(d);
  return temp.toLowerCase();
}