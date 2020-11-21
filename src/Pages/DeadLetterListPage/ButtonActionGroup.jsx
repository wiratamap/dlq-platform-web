import { DeleteOutlined, SendOutlined } from '@ant-design/icons';
import {
  Button, Col, Row, Tooltip
} from 'antd';
import React from 'react';
import PropTypes from 'prop-types';

const ButtonActionGroup = ({ deadLetterId, onHandleMessageAction }) => (
  <Row gutter={16}>
    <Col span={12}>
      <Tooltip title="Re Orchestrate">
        <Button
          data-testid={`re-orchestrate-button-${deadLetterId}`}
          type="primary"
          shape="circle"
          icon={<SendOutlined />}
          onClick={() => onHandleMessageAction(deadLetterId, 'SEND_TO_ORIGIN_TOPIC')}
        />
      </Tooltip>
    </Col>
    <Col span={12}>
      <Tooltip title="Delete">
        <Button
          data-testid={`delete-button-${deadLetterId}`}
          type="primary"
          danger
          shape="circle"
          icon={<DeleteOutlined />}
          onClick={() => onHandleMessageAction(deadLetterId, 'DELETE')}
        />
      </Tooltip>
    </Col>
  </Row>
);

ButtonActionGroup.propTypes = {
  deadLetterId: PropTypes.string.isRequired,
  onHandleMessageAction: PropTypes.func.isRequired
};

export default ButtonActionGroup;
