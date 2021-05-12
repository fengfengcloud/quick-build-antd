import { SelectOutlined } from '@ant-design/icons';
import { Popover } from 'antd';
import React, { useRef, useState } from 'react';
import { ModuleHierarchyChart } from '../../widget/ModuleHierarchyChart';

interface SelectChildModuleProps {
  title: string;
  moduleName: string;
  defaultModule?: string;
  callback: Function;
}

export const SelectChildModule: React.FC<SelectChildModuleProps> = ({
  title,
  moduleName,
  callback,
}) => {
  const [visible, setVisible] = useState<boolean>(false);
  const ref = useRef();
  return (
    <Popover
      visible={visible}
      onVisibleChange={(v) => setVisible(v)}
      title={title}
      trigger={['click']}
      overlayStyle={{
        maxWidth: '80%',
        maxHeight: `${document.body.clientHeight - 200}px`,
        minHeight: '300px',
        overflow: 'auto',
      }}
      content={
        <ModuleHierarchyChart
          moduleName={moduleName}
          ref={ref}
          onSelect={(node: any) => {
            setVisible(false);
            callback(node);
          }}
        />
      }
    >
      <SelectOutlined />
    </Popover>
  );
};
