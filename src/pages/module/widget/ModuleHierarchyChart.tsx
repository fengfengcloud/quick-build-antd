import React, { useEffect, useState } from 'react';
import OrganizationChart from '@dabeng/react-orgchart';
import { fetchModuleHierarchyData } from '../service';
import { Card, Tabs } from 'antd';
import { ChartNode } from './chartNode';

const { TabPane } = Tabs;

interface ModuleHierarchyChartProps {
  moduleName: string;
  onClick: Function;
}

const changeTextToName = (object: any) => {
  if (Array.isArray(object)) {
    object.forEach((o: any) => changeTextToName(o));
  } else if (Object.prototype.toString.call(object) === '[object Object]') {
    const obj = object;
    obj.name = object.text.replace(/<[^>]+>/g, '');
    obj.id = object.itemId;
    if (object.children) {
      changeTextToName(object.children);
    }
  }
};

export const ModuleHierarchyChart: React.FC<ModuleHierarchyChartProps> = ({
  moduleName,
  onClick,
}) => {
  const [parentTree, setParentTree] = useState<any>({});
  const [childTree, setChildTree] = useState<any>({});
  useEffect(() => {
    fetchModuleHierarchyData({
      moduleName,
    }).then((response) => {
      changeTextToName(response);
      const p = { ...response.children[0] };
      p.name = p.moduleTitle;
      p.title = '基准模块';
      p.children = p.children.filter((child: any) => child.isParent);
      setParentTree(p);
      const c = { ...response.children[0] };
      c.name = c.moduleTitle;
      c.title = '基准模块';
      c.children = c.children.filter((child: any) => child.isChild);
      setChildTree(c);
    });
  }, [moduleName]);

  return (
    <Card
      title="模块关联关系图"
      size="small"
      style={{ height: '100%' }}
      bodyStyle={{ paddingTop: 0, paddingBottom: 0, height: 'calc(100% -24px)' }}
    >
      <Tabs defaultActiveKey="parent">
        <TabPane tab="父模块" key="parent">
          <OrganizationChart
            datasource={parentTree}
            direction="b2t"
            collapsible={true}
            chartClass="moduleChart"
            NodeTemplate={ChartNode}
            // pan={true}
            // zoom={true}
            onClickNode={(node: any) => onClick(node)}
          />
        </TabPane>
        <TabPane tab="子模块" key="child">
          <OrganizationChart
            datasource={childTree}
            direction="b2t"
            collapsible={true}
            chartClass="moduleChart"
            NodeTemplate={ChartNode}
            // pan={true}
            // zoom={true}
            onClickNode={(node: any) => onClick(node)}
          />
        </TabPane>
      </Tabs>
    </Card>
  );
};
