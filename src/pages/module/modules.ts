import { ModuleModal, TextValue, ModuleState, ParentFilterModal, ParentFormModal, ViewSchemeType } from "./data";
import { querySyncModuleInfo, fetchObjectComboData, fetchObjectComboTreeData, fetchObjectComboTreePathData } from "./service";
import { applyAllOtherSetting, applyIf } from "@/utils/utils";
import { initUserFilterFieldInitValues } from "./UserDefineFilter";
import { getDefaultMonetaryPosition, getDefaultMonetaryType, getMonetary } from "./grid/monetary";
import { currentUser } from "umi";

const modules: Record<string, ModuleModal> = {};
const moduleComboDataSource: Record<string, TextValue[]> = {};
const moduleTreeDataSource: Record<string, TextValue[]> = {};
// 模块字段根据选择路径生成的树，非叶节点全部不可以选择，只能选择叶节点
const moduleTreePathDataSource: Record<string, TextValue[]> = {}

export const getModuleComboDataSource = (moduleName: string): TextValue[] => {
    if (!moduleComboDataSource[moduleName]) {
        moduleComboDataSource[moduleName] = fetchObjectComboData({
            moduleName,
            mainlinkage: true,          // 如果该模块有主链接，则加入，例如人员，则会在前面加上 部门 / 人员       
        }) as TextValue[];
    }
    return moduleComboDataSource[moduleName];
}

/**
 * 在记录新建了以后，检查是否有combo的缓存，如果有则加进去，如果没有则无动作
 * @param moduleName 
 * @param record 
 */
export const insertToModuleComboDataSource = (moduleName: string, record: any) => {
    if (moduleComboDataSource[moduleName]) {
        const { primarykey, namefield } = getModuleInfo(moduleName);
        moduleComboDataSource[moduleName].push({
            text: record[namefield],
            value: record[primarykey],
        })
    }
}

export const getModulTreeDataSource = (moduleName: string, allowParentValue: boolean, addCodeToText: boolean = false): TextValue[] => {
    const key = moduleName + (!!addCodeToText ? '1' : '2') + (allowParentValue ? '3' : '4');
    if (!moduleTreeDataSource[key]) {
        moduleTreeDataSource[key] = fetchObjectComboTreeData({ moduleName, allowParentValue, addCodeToText }) as TextValue[];
    }
    return moduleTreeDataSource[key];
}


// 模块字段根据选择路径生成的树，非叶节点全部不可以选择，只能选择叶节点
export const getModulTreePathDataSource = (moduleName: string): TextValue[] => {
    const key = moduleName;
    if (!moduleTreePathDataSource[key]) {
        moduleTreePathDataSource[key] = fetchObjectComboTreePathData({ objectname: moduleName }) as TextValue[];
    }
    return moduleTreePathDataSource[key];
}

// 将某些manytoone数组值，转换为文字描述,如果有separator,转换成字符串，否则转换成 数组
export const convertModuleIdValuesToText = (moduleName: string, values: any[], separator: string | undefined): any => {
    if (!Array.isArray(values))
        values = [values];
    const data = getModuleComboDataSource(moduleName);
    const arrayResult: any[] = values.map((value: any) => {
        for (let i in data) {
            if (data[i].value == value)
                return data[i].text;
        }
        return value == 'null' ? '未定义' : value;
    })
    if (separator)
        return arrayResult.join(separator);
    else
        return arrayResult;
}



// 将某些manytoone数组值，转换为文字描述,如果有separator,转换成字符串，否则转换成 数组
export const convertTreeModuleIdValuesToText = (moduleName: string, values: any[], separator: string | undefined): any => {
    if (!Array.isArray(values))
        return values;
    const data: TextValue[] = [];
    const joinChildren = (array: any) => {
        array.forEach((r: any) => {
            data.push(r)
            if (Array.isArray(r.children) && r.children.length > 0)
                joinChildren(r.children);
        });

    }
    joinChildren(getModulTreeDataSource(moduleName, true));
    const arrayResult: any[] = values.map((value: any) => {
        for (let i in data) {
            if (data[i].value == value)
                return data[i].text;
        }
        return value == 'null' ? '未定义' : value;
    })
    if (separator)
        return arrayResult.join(separator);
    else
        return arrayResult;
}



export const getModuleInfo = (moduleName: string): ModuleModal => {
    if (!modules[moduleName]) {
        setModuleInfo(moduleName, generateModuleInfo(querySyncModuleInfo(moduleName)));
    }
    return modules[moduleName];
}

export const hasModuleInfo = (moduleName: string): boolean =>
    !!modules[moduleName]

export const setModuleInfo = (moduleName: string, moduleModal: ModuleModal) => {
    modules[moduleName] = moduleModal;
    applyAllOtherSetting(modules[moduleName]);
    initUserFilterFieldInitValues(moduleName, getFilterScheme(modules[moduleName]));
}

export const generateModuleInfo = (module: any): ModuleModal => {
    const obj = module.fDataobject;
    const basefunction = obj.baseFunctions;
    // getAllGridSchemes(obj.gridSchemes).forEach((scheme: any) => {
    //     applyOtherSetting(scheme, scheme.othersetting)
    // })
    const moduleInfo: ModuleModal = {
        moduleid: obj.objectname,
        modulename: obj.objectname,
        objectname: obj.objectname,
        title: obj.title,
        primarykey: obj.primarykey,
        namefield: obj.namefield,
        namefieldtpl: obj.namefieldtpl,
        description: obj.description,
        iconcls: obj.iconcls,
        fields: obj.fDataobjectfields,
        gridDefaultSchemeId: obj.gridDefaultSchemeId,
        selectedmode: obj.selectedmode,
        gridschemes: obj.gridSchemes,
        formschemes: obj.fovFormschemes,
        viewschemes: obj.viewSchemes,
        userdefinedsorts: [],
        navigateSchemes: obj.navigateSchemes || [],
        filterSchemes: obj.filterSchemes || {},
        sortSchemes: obj.sortSchemes || {},
        excelSchemes: obj.excelschemes || [],
        associates: obj.fovDataobjectassociates || [],
        istreemodel: !!obj.istreemodel,
        codelevel: obj.codelevel,
        orderfield: obj.orderfield,
        helpmarkdown: obj.helpmarkdown,
        attachmentTypes: obj.attachmentTypes,
        sqlparamsDefine: obj.fDataobjectsqlparams,
        recordPrintSchemes: obj.recordPrintSchemes,
        moduleLimit: {
            hasenable: obj.hasenable,
            hasbrowse: obj.hasbrowse,
            hasinsert: obj.hasinsert,
            allownewinsert: obj.allownewinsert,
            allowinsertexcel: obj.allowinsertexcel,
            hasedit: obj.hasedit,
            hasdelete: obj.hasdelete,
            rowediting: !!obj.rowediting,
            hasattachment: obj.hasattachment,
            hasapprove: obj.hasapprove,
            hasaudit: obj.hasaudit,
            hasdatamining: obj.hasdatamining,
            hassqlparam: obj.hassqlparam,
            issystem: obj.issystem,
        },
        userLimit: {
            query: basefunction.query,
            new: basefunction.new,
            edit: basefunction.edit,
            delete: basefunction.delete,
            newnavigate: basefunction.newnavigate,
            approve: {
                start: basefunction.approvestart,
                pause: basefunction.approvepause,
                cancel: basefunction.approvecancel,
            },
            attachment: {
                query: basefunction.attachmentquery,
                add: basefunction.attachmentadd,
                edit: basefunction.attachmentedit,
                delete: basefunction.attachmentdelete,
            }
        },
        additionFunctions: obj.additionFunctions,
    };
    return moduleInfo;
}

/**
 * 根据方案类型获取一个form方案
 * @param moduleName 
 * @param type 
 */
export const getFormSchemeFormType = (moduleName: string, type: string) => {
    const moduleInfo: ModuleModal = getModuleInfo(moduleName);
    return moduleInfo.formschemes.find((scheme) => scheme.formtype == type)
}

/**
 * 返回一个scheme方案的具体定义
 */
export const getGridScheme = (schemeid: string, moduleInfo: ModuleModal) => {
    const gridSchemes: any = moduleInfo.gridschemes;
    let gs = null;
    if (gridSchemes.system)
        gridSchemes.system.forEach((scheme: any) => {
            if (scheme.gridschemeid == schemeid) {
                gs = scheme;
                //return false;
            }
        });
    if (gs == null && gridSchemes.owner)
        gridSchemes.owner.forEach((scheme: any) => {
            if (scheme.gridschemeid == schemeid) {
                gs = scheme;
                //return false;
            }
        });
    if (gs == null && gridSchemes.othershare)
        gridSchemes.othershare.forEach((scheme: any) => {
            if (scheme.gridschemeid == schemeid) {
                gs = scheme;
                //return false;
            }
        });
    return gs;
}

/**
 * 取得缺省的列表方案
 */
export const getGridDefaultScheme = (moduleInfo: ModuleModal) => {
    const gridSchemes: any = moduleInfo.gridschemes;
    let gs = getGridScheme(moduleInfo.gridDefaultSchemeId, moduleInfo);
    return gs ? gs : gridSchemes.system
        ? gridSchemes.system[0]
        : gridSchemes.owner
            ? gridSchemes.owner[0]
            : gridSchemes.othershare[0]
}

export const getAllGridSchemes = (gridschemes: any): any[] => {
    const result = [];
    if (gridschemes.system)
        result.push(...gridschemes.system);
    if (gridschemes.owner)
        result.push(...gridschemes.owner);
    if (gridschemes.othershare)
        result.push(...gridschemes.othershare);
    return result;
}

/**
 * 返回一个自定义筛选方案，如果有多个，那么先选一个，一般只有一个
 * @param moduleInfo 
 */
export const getFilterScheme = (moduleInfo: ModuleModal): any => {
    const s = moduleInfo.filterSchemes;
    return s.system ? s.system[0] : s.owner ? s.owner[0] : s.othershare ? s.othershare[0] : null
}


/**
 * 返回自定义筛选方案初始隐藏还是显示
 * @param moduleInfo 
 */
export const getFilterRegionVisible = (moduleInfo: ModuleModal): boolean => {
    const scheme: any = getFilterScheme(moduleInfo);
    if (scheme)
        return scheme.details[0].regionVisible !== false;   // 默认显示
    else
        return true;
}
/**
 * 返回自定义筛选方中需要隐藏的字段的起始位置
 * @param moduleInfo 
 */
export const getFilterRestNumber = (moduleInfo: ModuleModal): number => {
    const scheme: any = getFilterScheme(moduleInfo);
    if (scheme)
        return scheme.details[0].restNumber || -1;
    else
        return -1;
}
/**
 * 返回自定义筛选方中初始的隐藏字段是否隐藏
 * @param moduleInfo 
 */
export const getFilterRestHidden = (moduleInfo: ModuleModal): boolean => {
    const scheme: any = getFilterScheme(moduleInfo);
    if (scheme)
        return !!scheme.details[0].restHidden;
    else
        return false;
}

export const getSortSchemes = (moduleInfo: ModuleModal): any[] => {
    let result: any[] = [];
    const schemes = moduleInfo.sortSchemes;
    if (schemes.system)
        result = result.concat(schemes.system)
    if (schemes.owner)
        result = result.concat(schemes.owner)
    if (schemes.othershare)
        result = result.concat(schemes.othershare)
    return result;
}


/**
 * 判断模块数据是否有新建的权限
 * @param moduleInfo 
 */
export const hasInsert = (moduleInfo: ModuleModal): boolean => {
    return moduleInfo.moduleLimit.hasinsert && moduleInfo.userLimit.new;
}

/**
 * 判断模块数据是否有修改的权限
 * @param moduleInfo 
 */
export const hasEdit = (moduleInfo: ModuleModal): boolean => {
    return moduleInfo.moduleLimit.hasedit && moduleInfo.userLimit.edit;
}

/**
 * 判断记录的附件否可以新增。审批过后只有录入人员才可以新增附件
 * @param moduleInfo 
 * @param record 
 */
export const canAttachmentInsert = (moduleInfo: ModuleModal, record: any): boolean => {
    if (moduleInfo.moduleLimit.hasapprove) {
        if (record['actEndTime']) {
            // 审批完成也可以由当前审批人员进行新增
            return record['actStartUserId'] == currentUser.userid;
        }
        if (record['actProcInstId'] > 0) {
            if (record['actStartUserId'] == record['actAssignee'] &&
                (record['actAssignee'] == currentUser.userid)) {
                // 如果当前审批人员是提交人员，那么就可以进行新增
            } else return false
        }
    }
    if (moduleInfo.moduleLimit.hasaudit) {
        if (record['auditingDate'])
            // 审核完成也可以由当前审核人员进行新增，如果是他自己新增审核的话
            return record['auditingUserid'] == currentUser.userid;
    }
    // 如果设置了需要去后台判断是否允许编译的加在这里
    return true;
}

/**
 * 判断记录的附件否可以删除。审批过后将不能删除
 * @param moduleInfo 
 * @param record 
 */
export const canAttachmentDelete = (moduleInfo: ModuleModal, record: any): boolean => {
    if (moduleInfo.moduleLimit.hasapprove) {
        if (record['actEndTime']) return false;
        if (record['actProcInstId'] > 0) {
            if (record['actStartUserId'] == record['actAssignee'] &&
                (record['actAssignee'] == currentUser.userid)) {
                // 如果当前审批人员是提交人员，那么就可以进行修改
            } else return false
        }
    }
    if (moduleInfo.moduleLimit.hasaudit) {
        if (record['auditingDate'])
            return false;
    }
    // 如果设置了需要去后台判断是否允许编译的加在这里
    return true;
}

/**
 * 判断记录是否可以修改
 * @param moduleInfo 
 * @param record 
 */
// 此条记录是否可以修改,如果有审批操作，由不允许修改。或者是轮到当前提交人员的操作，那就又可以修改了
export const canEdit = (moduleInfo: ModuleModal, record: any): { canEdit: boolean, message: string } => {
    const { namefield } = moduleInfo;
    const title = record[namefield];
    if (moduleInfo.moduleLimit.hasapprove) {
        if (record['actEndTime']) return {
            canEdit: false,
            message: `『 ${title}』已审批完成，不允许修改!`
        }
        if (record['actProcInstId'] > 0) {
            if (record['actStartUserId'] == record['actAssignee'] &&
                (record['actAssignee'] == currentUser.userid)) {
                // 如果当前审批人员是提交人员，那么就可以进行修改
            } else return {
                canEdit: false,
                message: `『${title}』正在审批中，不允许修改!`
            }
        }
    }
    if (moduleInfo.moduleLimit.hasaudit) {
        if (record['auditingDate'])
            return {
                canEdit: false,
                message: `『${title}』已审核，不允许修改!`
            }
    }
    // 如果设置了需要去后台判断是否允许编译的加在这里
    return {
        canEdit: true,
        message: ''
    };
}

/**
 * 判断是否当前模块的记录可以移动，有orderno字段，并且是可以修改的
 * @param moduleInfo 
 */
export const canMoveRow = (moduleInfo: ModuleModal) => {
    return moduleInfo.orderfield && hasEdit(moduleInfo);
}

/**
 * 判断模块数据是否有删除的权限
 * @param moduleInfo 
 */
export const hasDelete = (moduleInfo: ModuleModal): boolean => {
    return moduleInfo.moduleLimit.hasdelete && moduleInfo.userLimit.delete;
}

/**
 * 判断记录是否能被删除
 * @param moduleInfo 
 * @param record 
 */
export const canDelete = (moduleInfo: ModuleModal, record: any): { canDelete: boolean, message: string } => {
    const { namefield, moduleLimit } = moduleInfo;
    const title = record[namefield];
    if (moduleLimit.hasapprove) {
        if (record['actEndTime']) return {
            canDelete: false,
            message: `『 ${title}』已审批完成，不允许删除!`
        }
        if (record['actProcInstId'] > 0) return {
            canDelete: false,
            message: `『${title}』正在审批中，不允许删除!`
        }
    }
    if (moduleLimit.hasaudit) {
        if (record['auditingDate'])
            return {
                canDelete: false,
                message: `『 ${title}』已审核，不允许删除!`
            }
    }
    if (moduleLimit.hasattachment) {
        if (record['attachmentcount']) {
            return {
                canDelete: false,
                message: `『 ${title}』有${record['attachmentcount']}个附件文件，不允许删除!`
            }
        }
    }
    // 如果设置了需要去后台判断是否允许删除的加在这里
    return {
        canDelete: true,
        message: ''
    };
}

// 在父模块或导航中找到字段是parentfieldname的条件的值
export const getParentOrNavigateIdAndText = (state: ModuleState, pModuleName: string) => {
    const { filters: { parentfilter, navigate } } = state;
    if (parentfilter && parentfilter.fieldahead === pModuleName)
        return {
            id: parentfilter.fieldvalue,
            text: parentfilter.text,
            moduleTitle: parentfilter.fieldtitle,
            operator: parentfilter.operator
        }
    for (let i in navigate) {
        const filter = navigate[i];
        if (filter.fieldahead === pModuleName)
            return {
                id: filter.fieldvalue,
                text: filter.text,
                moduleTitle: filter.fieldtitle,
                operator: filter.operator
            }
    }
    return null;
}


/**
 * 根据字段ＩＤ号取得字段的定义,如果没找到返回null
 */
export const getFieldDefine: any = (fieldId: string, moduleInfo: ModuleModal) => {
    if (!moduleInfo)
        return null;
    const { fields } = moduleInfo;
    for (let i in fields) {
        if (fields[i].fieldid === fieldId || fields[i].fieldname === fieldId)
            return fields[i];
    }
    return null;
}

/**
 * 把在grid和form中出现的父模块数据加入到fields中去
 * @param moduleName 
 * @param gridorformField 
 */
export const addParentAdditionField = (moduleInfo: ModuleModal, gridorformField: any) => {
    let field = getFieldDefine(gridorformField.fieldid, moduleInfo);
    if (field) return field;
    let parentModuleInfo = getModuleInfo(gridorformField.additionObjectname);
    let pField = getFieldDefine(gridorformField.fieldid, parentModuleInfo);
    field = {
        ...pField,
        fieldname: gridorformField.additionFieldname,
        fieldtitle: gridorformField.title || gridorformField.defaulttitle,
        fieldid: gridorformField.fieldid,
        // 父模块字段都置为不可更改
        allownew: false,
        allowedit: false,
    }
    if (pField.isManyToOne) {
        field.manyToOneInfo = {};
        applyIf(field.manyToOneInfo, pField.manyToOneInfo);
        field.manyToOneInfo.keyField = field.fieldname + '.' + field.manyToOneInfo.keyOrginalField.fieldname;
        field.manyToOneInfo.nameField = field.fieldname + '.' + field.manyToOneInfo.nameOrginalField.fieldname;
    }
    moduleInfo.fields.push(field);
    return field;
}

export const getSqlParamDefaultValue = (moduleInfo: ModuleModal) => {
    if (moduleInfo.moduleLimit.hassqlparam) {
        const result: any = {};
        moduleInfo.sqlparamsDefine.forEach(def => result[def.paramname] =
            { title: def.title, operator: '=', value: null });
        return result;
    } else
        return null;
}

export const getDefaultModuleState = ({ moduleName, parentFilter, parentForm }:
    { moduleName: string, parentFilter?: ParentFilterModal, parentForm?: ParentFormModal }): ModuleState => {
    const moduleInfo = getModuleInfo(moduleName);
    const moduleState: ModuleState = {
        moduleName,
        //moduleInfo,
        dataSourceLoadCount: 1,
        currentGridschemeid: getGridDefaultScheme(moduleInfo).gridschemeid,
        monetary: getMonetary(getDefaultMonetaryType(moduleName) || 'tenthousand'),
        monetaryPosition: getDefaultMonetaryPosition(moduleName) || 'behindnumber',
        dataSource: [],
        selectedRowKeys: [],
        selectedTextValue: [],
        expandedRowKeys: [],
        fetchLoading: false,
        formState: {
            visible: false,
            formType: 'display',
            showType: moduleInfo.formschemes[0].showType || 'modal',
            currRecord: {}
        },
        pinkey: '',
        filters: {
            navigate: [],
            viewscheme: { title: undefined, viewschemeid: undefined },
            parentfilter: parentFilter,
            sqlparam: getSqlParamDefaultValue(moduleInfo),
        },
        sorts: [],
        sortschemeid: null,
        sortMultiple: {},
        gridParams: {
            curpage: 1,
            limit: 20,
            start: 0,
            total: 0,
            totalpage: 0,
        },
        currSetting: {
            navigate: {
                visible: true,
            },
            userFilterRegionVisible: getFilterRegionVisible(moduleInfo),
            userFilterRestNumber: getFilterRestNumber(moduleInfo),   // 筛选字段从第几个开始隐藏，-1表示不隐藏
            userFilterRestHidden: getFilterRestHidden(moduleInfo),   // 筛选字段是否隐藏 展开，收起
            gridSize: parentFilter ? 'small' : 'middle'
        },
        gridExportSetting: {
            usemonetary: false,
            colorless: false,
            sumless: false,
            unitalone: false,
            pagesize: 'pageautofit',   // pageautofit,A4,A4landscape,A3,A3landscape
            scale: 100,      // 0-1+    
            autofitwidth: true,
        },
        parentForm,
    };
    return moduleState;
}

/**
 * 取得定义的south区域，如果有的话，就把这个定义grid展开的内容
 * @param moduleInfo 
{   iscollapsed: false,
    isdisabledesign: true,
    ishidden: false,
    region: "south",
    worh: "350",
    details: [{
        associatedetailid: "2c948a8262eae53c0162eb040043000f",
        defaulttitle: "数据字典属性值(字典)",
        fieldahead: "FDictionarydetail.with.FDictionary",
        issystem: true,
        subobjecteastregion: false,
        subobjectname: "FDictionarydetail",
        subobjectnavigate: false,
        subobjectsouthregion: false,
        title: "数据字典属性值"
    }]
}
 */
export const getAssociatesSouth = (moduleInfo: ModuleModal): any[] => {
    const { associates } = moduleInfo;
    if (associates && associates.length) {
        const south = associates.find((item: any) => item.region == 'south');
        if (south)
            return south.details || [];
    }
    return [];
}

export const hasAssociatesSouth = (moduleInfo: ModuleModal): boolean => {
    const { associates } = moduleInfo;
    if (associates && associates.length) {
        const south = associates.find((item: any) => item.region == 'south');
        if (south && south.details)
            return !!south.details.length;
    }
    return false;
}

export const hasMonetaryField = (moduleInfo: ModuleModal): boolean => {
    return moduleInfo.fields.some(field => field.ismonetary && !field.isdisable);
}

export const getViewSchemes = (schemes: any): TextValue[] => {
    const result: TextValue[] = new Array();
    schemes.system?.forEach((scheme: ViewSchemeType) =>
        result.push({ text: scheme.title, value: scheme.viewschemeid }))
    schemes.owner?.forEach((scheme: ViewSchemeType) =>
        result.push({ text: scheme.title, value: scheme.viewschemeid }))
    schemes.othershare?.forEach((scheme: ViewSchemeType) =>
        result.push({ text: scheme.title, value: scheme.viewschemeid }))
    return result;
}