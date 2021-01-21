import React from 'react';
import { ModuleModal, ModuleState } from '../data';
import NavigateButton from './NavigateButton';
import ViewSchemeButton from './ViewSchemeButton';
import UserDefineFilterButton from './UserDefineFilterButton';
import { getFilterScheme } from '../modules';

const PageHeaderToolbar = (({ moduleState, moduleInfo, dispatch }:
    { moduleState: ModuleState, moduleInfo: ModuleModal, dispatch: any }) => {

    return <>{
        Object.keys(moduleInfo.viewschemes).length ? <ViewSchemeButton
            moduleState={moduleState} moduleInfo={moduleInfo} dispatch={dispatch}
        ></ViewSchemeButton> : null}
        {moduleInfo.navigateSchemes.length > 0 ?
            <NavigateButton moduleState={moduleState} dispatch={dispatch} /> : null}
        {getFilterScheme(moduleInfo) ?
            <UserDefineFilterButton moduleState={moduleState} dispatch={dispatch} /> : null}
        <span></span><span></span>
    </>
})

export const DetailGridPageHeaderToolbar = (({ moduleState, moduleInfo, dispatch, enableUserFilter }:
    { moduleState: ModuleState, moduleInfo: ModuleModal, dispatch: any, enableUserFilter:boolean }) => {
    return <>{
        Object.keys(moduleInfo.viewschemes).length ? <ViewSchemeButton
            moduleState={moduleState} moduleInfo={moduleInfo} dispatch={dispatch}
        ></ViewSchemeButton> : null}
        {/* {moduleInfo.navigateSchemes.length > 0 ?
            <NavigateButton moduleState={moduleState} dispatch={dispatch} /> : null} */}
        {enableUserFilter && getFilterScheme(moduleInfo) ?
            <UserDefineFilterButton moduleState={moduleState} dispatch={dispatch} /> : null}
        <span></span><span></span>
    </>
})


export default PageHeaderToolbar;
