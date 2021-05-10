import React, { useEffect, useRef, useState } from 'react';
import {
  getAllhasChildrenRowids,
  getAllLeafRecords,
  getAllleafRowids,
} from '@/pages/datamining/utils';
import { apply, uuid } from '@/utils/utils';
import { DownOutlined, FileOutlined } from '@ant-design/icons';
import { Card, Col, message, Row, Tree } from 'antd';
import type { Key } from 'antd/es/table/interface';
import { fetchFormDetails, fetchModuleFields } from '../service';
import { ModuleHierarchyChart } from '../widget/ModuleHierarchyChart';

interface DesignFormProps {
  formScheme: any;
}

const getTitle = (node: any, text?: string) => {
  if (node.cls) return <span className={node.cls}>{text || node.text}</span>;
  return text || node.text;
};

const changeTextToTitle = (object: any) => {
  if (Array.isArray(object)) {
    object.forEach((o: any) => changeTextToTitle(o));
  } else if (Object.prototype.toString.call(object) === '[object Object]') {
    if (!object.title) apply(object, { title: getTitle(object) });
    if (object.children) {
      object.children.forEach((child: any) => {
        apply(child, {
          parent: object,
        });
      });
      changeTextToTitle(object.children);
    }
  }
};

/**
 * 在重新加载了可被选择的字段以后，把已经选中的都加进去。
 */
const syncCanSelected = (canSelectTree: any[], details: any[]): string[] => {
  const canSelectTreeItems = getAllleafRowids(canSelectTree, 'itemId');
  const detailItems = getAllleafRowids(details, 'itemId');
  return canSelectTreeItems.filter((key) => detailItems.find((dkey) => dkey === key));
};

export const DesignForm: React.FC<DesignFormProps> = ({ formScheme }) => {
  const { formschemeid } = formScheme;
  const hRef: any = useRef();
  const [canSelectTree, setCanSelectTree] = useState<any[]>([]);
  const [canSelectTreeCheckedkey, setCanSelectTreeCheckedkey] = useState<string[]>([]);
  const [canSelectTreeExpandKey, setCanSelectTreeExpandKey] = useState<string[]>([]);
  const [canSelectTreeSelectedKey, setCanSelectTreeSelectedKey] = useState<string[]>([]);
  const [details, setDetails] = useState<any[]>([]);
  const [detailsExpandKey, setDetailsExpandKey] = useState<string[]>([]);
  const [detailsSelectedKey, setDetailsSelectedKey] = useState<string[]>([]);
  const [currModule, setCurrModule] = useState<any>({});
  const fetchSelectedModuleFields = (node: any, selectedKeys?: string[]) => {
    if (node === currModule) {
      setCanSelectTreeSelectedKey(selectedKeys || []);
      return;
    }

    setCurrModule(node);
    if (node.moduleName)
      fetchModuleFields({
        moduleName: node.moduleName,
        isChildModule: !!node.isChild,
        modulePath: node.itemId,
      }).then((response: any[]) => {
        const ekeys: string[] = [];
        response.forEach((rec) => {
          apply(rec, {
            key: rec.text,
            title: getTitle(rec),
          });
          ekeys.push(rec.key);
          // delete rec.text;
          if (rec.children) {
            (rec.children as any[]).forEach((crec) => {
              apply(crec, {
                key: crec.itemId,
                title: getTitle(crec),
                parent: rec,
              });
              // delete crec.text;
              // 子模块的聚合字段
              if (crec.children) {
                ekeys.push(crec.key);
                (crec.children as any[]).forEach((ccrec) => {
                  apply(ccrec, {
                    key: ccrec.itemId,
                    title: getTitle(ccrec),
                    parent: crec,
                  });
                  // delete ccrec.text;
                });
              }
            });
          }
        });
        setCanSelectTreeExpandKey(ekeys);
        setCanSelectTree(response);
        setCanSelectTreeSelectedKey(selectedKeys || detailsSelectedKey);
      });
    const { children, ...other } = node;
    message.info(JSON.stringify(other));
  };

  // 选择或取消选择后更新已设置的字段
  const syncSelected = (checked: Key[], info: any) => {
    setCanSelectTreeCheckedkey(checked as string[]);
    // 先检查checked的已选中列中有没有，没有的加入
    info.checkedNodes
      .filter((n: any) => !n.children)
      .forEach((node: any) => {
        if (!getAllleafRowids(details, 'itemId').includes(node.itemId)) {
          // 新选上的，加入，先看看当前选中节点的父节点有没有，有的话加在下面，没有则加入父节点
          let { text } = node;
          if (currModule.isParent) {
            text = `${currModule.qtip}--${text}`;
          } else if (currModule.isChild) {
            text = `${currModule.qtip}--${node.parent.text}--${text}`;
          }
          const snode: any = {
            key: node.itemId,
            itemId: node.itemId,
            text,
            title: getTitle(node, text),
            iconCls: node.iconCls,
            cls: node.cls,
            icon: node.icon,
            leaf: true,
          };
          let snodeParent = (details[0].children as any[]).find(
            (d) => d.title === node.parent.title,
          );
          if (snodeParent) {
            if (!snodeParent.children) snodeParent.children = [];
            snode.parent = snodeParent;
            snodeParent.children.push(snode);
          } else {
            snodeParent = {
              key: uuid(),
              text: node.parent.title,
              title: node.parent.title,
              tf_title: node.parent.title,
              leaf: false,
              expanded: true,
              tf_displayGroup: true,
              children: [snode],
            };
            snode.parent = snodeParent;
            detailsExpandKey.push(snodeParent.key);
            details[0].children.push(snodeParent);
          }
        }
      });
    // 检查unchecked的在选中列表中有没有，有则删除
    getAllLeafRecords(canSelectTree)
      .filter((rec) => !info.checkedNodes.find((node: any) => node === rec))
      .forEach((crec) => {
        const deleted = getAllLeafRecords(details).find((rec) => rec.itemId === crec.itemId);
        if (deleted) {
          console.log(deleted);
          const arr = deleted.parent.children as [];
          arr.splice(
            arr.findIndex((item: any) => item.itemId === deleted.itemId),
            1,
          );
        }
      });
    setDetails([...details]);
  };

  useEffect(() => {
    setCanSelectTreeCheckedkey(syncCanSelected(canSelectTree, details));
  }, [canSelectTree]);

  useEffect(() => {
    fetchFormDetails({
      formSchemeId: formschemeid,
    }).then((response) => {
      const ds = [
        {
          key: 'root',
          children: response.children,
          title: '已经选择的字段',
        },
      ];
      changeTextToTitle(ds);
      setDetailsExpandKey(getAllhasChildrenRowids(ds, 'key'));
      setDetails(ds);
      fetchSelectedModuleFields({ moduleName: formScheme['FDataobject.objectid'] });
    });
  }, []);

  return (
    <Row gutter={16} style={{ height: 'calc(100% )' }}>
      <Col span={12}>
        <ModuleHierarchyChart
          moduleName={formScheme['FDataobject.objectid']}
          onClick={(node: any) => {
            fetchSelectedModuleFields(node);
          }}
          ref={hRef}
        />
      </Col>
      <Col span={5}>
        <Card title="可供选择的字段" size="small">
          <Tree
            style={{ height: 'calc(100vh - 149px)', overflow: 'auto' }}
            switcherIcon={<DownOutlined />}
            checkable
            showIcon
            icon={(props: any) =>
              props.iconCls ? <span className={props.iconCls}></span> : <FileOutlined />
            }
            treeData={canSelectTree}
            checkedKeys={canSelectTreeCheckedkey}
            onCheck={(checked, info) => {
              syncSelected(checked as Key[], info);
            }}
            expandedKeys={canSelectTreeExpandKey}
            onExpand={(expandKeys) => setCanSelectTreeExpandKey(expandKeys as string[])}
            selectedKeys={canSelectTreeSelectedKey}
            onSelect={(selectedKeys, info) => {
              setCanSelectTreeSelectedKey(selectedKeys as string[]);
              setDetailsSelectedKey(selectedKeys as string[]);
              // 如果是选中的
              console.log(selectedKeys);
              console.log(info);
            }}
          ></Tree>
        </Card>
      </Col>
      <Col span={7}>
        <Card title="已经设置的分组和字段" size="small">
          <Tree
            style={{ height: 'calc(100vh - 149px)', overflow: 'auto' }}
            switcherIcon={<DownOutlined />}
            checkable={false}
            showLine={false}
            showIcon
            icon={(props: any) =>
              props.iconCls ? <span className={props.iconCls}></span> : <FileOutlined />
            }
            draggable
            treeData={details}
            expandedKeys={detailsExpandKey}
            onExpand={(expandKeys) => setDetailsExpandKey(expandKeys as string[])}
            selectedKeys={detailsSelectedKey}
            onSelect={(selectedKeys, info) => {
              setDetailsSelectedKey(selectedKeys as string[]);
              const { itemId } = info.node as any;
              if (info.selected && itemId) {
                const path = itemId.substring(0, itemId.indexOf('|'));
                fetchSelectedModuleFields(
                  hRef.current.getNodeFromItemId(path),
                  selectedKeys as string[],
                );
              }
            }}
          ></Tree>
        </Card>
      </Col>
    </Row>
  );
};
