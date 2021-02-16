import { BarChartOutlined, UnorderedListOutlined } from '@ant-design/icons';
import React from 'react';

interface ToggleTableChartButtonProps {
  showGrid: boolean;
  setShowGrid: Function;
}

const ToggleTableChartButton: React.FC<ToggleTableChartButtonProps> = ({
  showGrid,
  setShowGrid,
}) => {
  return showGrid ? (
    <a onClick={() => setShowGrid((value: boolean) => !value)}>
      <BarChartOutlined style={{ paddingLeft: '8px' }} />
    </a>
  ) : (
    <a onClick={() => setShowGrid((value: boolean) => !value)}>
      <UnorderedListOutlined style={{ paddingLeft: '8px' }} />
    </a>
  );
};

export default ToggleTableChartButton;
