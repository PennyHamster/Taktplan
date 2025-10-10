import React from 'react';
import {
  ModalBackdrop,
  ModalContainer,
  ModalHeader,
  ModalTitle,
  ModalBody,
  ModalFooter,
  Input,
  Select,
  Button,
  TextArea
} from './TaskModal.styles';

const TaskModal = ({ show, handleClose, handleSave }) => {
  if (!show) {
    return null;
  }

  return (
    <ModalBackdrop>
      <ModalContainer>
        <ModalHeader>
          <ModalTitle>New Task</ModalTitle>
        </ModalHeader>
        <ModalBody>
          <Input type="text" placeholder="Title" />
          <TextArea placeholder="Description"></TextArea>
          <Select>
            <option value="1">Priority 1 (High)</option>
            <option value="2">Priority 2 (Medium)</option>
            <option value="3">Priority 3 (Low)</option>
          </Select>
        </ModalBody>
        <ModalFooter>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSave} primary>Save</Button>
        </ModalFooter>
      </ModalContainer>
    </ModalBackdrop>
  );
};

export default TaskModal;