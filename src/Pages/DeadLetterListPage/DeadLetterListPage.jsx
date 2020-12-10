import {
  Card,
  Col,
  Divider,
  Input,
  List,
  message,
  Row,
  Spin,
  Table
} from 'antd';
import axios from 'axios';
import moment from 'moment';
import React, { useEffect, useState } from 'react';
import ReactJson from 'react-json-view';
import { API_RESOURCE } from '../../Configurations/url';
import ButtonActionGroup from './ButtonActionGroup';

const DeadLetterListPage = () => {
  const [deadLetters, setDeadLetters] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchDeadLetters = async (queryParameter) => {
    try {
      setIsLoading(true);
      const { data } = await axios.get(
        `${API_RESOURCE.DEAD_LETTERS}${queryParameter}`
      );
      setDeadLetters(data);
    } catch (error) {
      message.error('Something went wrong when try to fetch dead letters');
    } finally {
      setIsLoading(false);
    }
  };

  const messageAction = {
    DELETE: 'delete',
    SEND_TO_ORIGIN_TOPIC: 're-orchestrate'
  };

  const onHandleMessageAction = async (deadLetterId, deleteAction) => {
    try {
      setIsLoading(true);
      const requestBody = {
        deleteAction
      };
      await axios.delete(`${API_RESOURCE.DEAD_LETTERS}/${deadLetterId}`, {
        data: requestBody
      });
      const newDeadLetters = deadLetters.filter(
        (deadLetter) => deadLetter.id !== deadLetterId
      );
      setDeadLetters(newDeadLetters);
      message.success(
        `Success to ${messageAction[deleteAction]} message with id ${deadLetterId}`
      );
    } catch (error) {
      message.error(
        `Failed to take an action on message ${deadLetterId}, please try again!`
      );
    } finally {
      setIsLoading(false);
    }
  };

  const onSearch = async (value) => {
    const queryParameter = `?eventId=${value}`;
    fetchDeadLetters(queryParameter);
  };

  useEffect(() => {
    fetchDeadLetters('');
  }, []);

  const columns = [
    {
      title: 'Origin Topics',
      dataIndex: 'originTopics',
      key: 'originTopics',
      render: (originTopics) => (
        <List
          size="large"
          bordered
          dataSource={originTopics}
          renderItem={(originTopic) => (
            <List.Item key={originTopic.name}>{originTopic.name}</List.Item>
          )}
        />
      )
    },
    {
      title: 'Message',
      dataIndex: 'originalMessage',
      key: 'originalMessage',
      render: (originalMessage) => {
        const { eventId } = JSON.parse(originalMessage);
        return (
          <div data-testid={`original-message-${eventId}`}>
            <ReactJson
              name="originalMessage"
              src={JSON.parse(originalMessage)}
            />
          </div>
        );
      }
    },
    {
      title: 'Reason',
      dataIndex: 'reason',
      key: 'reason'
    },
    {
      title: 'Thrown At',
      dataIndex: 'createdDate',
      key: 'thrownAt',
      render: (createdDate) => moment(createdDate).format('MMM Do YYYY, H:mm:ss'),
      defaultSortOrder: 'descend',
      sorter: (deadLetter, anotherDeadLetter) => moment(deadLetter.createdDate).unix()
        - moment(anotherDeadLetter.createdDate).unix()
    },
    {
      title: 'Action',
      key: 'action',
      dataIndex: 'id',
      render: (deadLetterId) => (
        <ButtonActionGroup
          deadLetterId={deadLetterId}
          onHandleMessageAction={onHandleMessageAction}
        />
      )
    }
  ];

  return (
    <Row
      data-testid="dead-letter-list-page"
      justify="center"
      style={{ paddingTop: 20, backgroundColor: '#e8e8e8', minHeight: '900px' }}
    >
      <Col span={22}>
        <Card title="Dead Letters">
          <Input.Search
            placeholder="Search by event id"
            onSearch={onSearch}
            enterButton
            style={{ width: '500px' }}
            size="large"
          />
          <Divider />
          <Spin spinning={isLoading}>
            <Table rowKey="id" columns={columns} dataSource={deadLetters} />
          </Spin>
        </Card>
      </Col>
    </Row>
  );
};

export default DeadLetterListPage;
