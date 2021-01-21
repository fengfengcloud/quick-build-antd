import React from 'react';
import { Menu } from 'antd';
import { ExpandGroupTreeFieldModal } from '../data';
import { getMenuAwesomeIcon } from '@/utils/utils';

const groupMenu = (expandGroupFieldsTree: ExpandGroupTreeFieldModal[], callback: Function) => {
    let keyCount = 1;
    const getMenu = (groups: ExpandGroupTreeFieldModal[]) =>
        groups.map(group => {
            if (group.text === '-')
                return <Menu.Divider key={'dividerkey' + keyCount++} />;
            if (group.menu)
                return [group.fieldid ?
                    <Menu.Item icon={getMenuAwesomeIcon(group.iconCls)} key={group.fieldid}
                        onClick={() => {
                            callback(group)
                        }}>
                        {group.text || group.title}
                    </Menu.Item> : null,
                <Menu.SubMenu title={group.text} icon={getMenuAwesomeIcon(group.iconCls)}
                    key={(group.fieldid || 'submenu') + keyCount++}>
                    {getMenu(group.menu)}
                </Menu.SubMenu>]
            else
                return <Menu.Item icon={getMenuAwesomeIcon(group.iconCls)} key={group.fieldid}
                    onClick={() => {
                        callback(group)
                    }}>
                    {group.text || group.title}
                </Menu.Item>
        })
    return getMenu(expandGroupFieldsTree || []);
}

export default groupMenu;

