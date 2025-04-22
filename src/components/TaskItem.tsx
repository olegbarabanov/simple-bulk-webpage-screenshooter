import { Button, Form, InputGroup, Spinner } from "react-bootstrap";
import { BoxArrowUpRight, Download, X } from "react-bootstrap-icons";

export enum ITaskItemStatus {
  PENDING,
  PROCEED,
  DONE,
  ERROR,
}

export interface ITaskItem {
  uid: number;
  url: string;
  width: number;
  height: number;
  delay: number;
  blob?: Blob;
  status: ITaskItemStatus;
}

const TaskItem = ({
  onChange = () => {},
  onDelete = () => {},
  lock = false,
  task,
}: {
  task: ITaskItem;
  lock: boolean;
  onChange: (item: ITaskItem) => void;
  onDelete: (item: ITaskItem) => void;
}): React.JSX.Element => {
  const renderStatus = (task: ITaskItem) => {
    switch (task.status) {
      case ITaskItemStatus.PENDING:
        return "--";
      case ITaskItemStatus.PROCEED:
        return <Spinner animation="border" />;
      case ITaskItemStatus.DONE:
        return (
          <div className="d-flex gap-3">
            <a
              href={task.blob ? URL.createObjectURL(task.blob) : ""}
              download={task.url
                .replace(/[^\w]+/g, "-")
                .concat("-",String(Date.now()), ".png")}
            >
              <Download></Download>
            </a>
            <a
              href={task.blob ? URL.createObjectURL(task.blob) : ""}
              target="_blank"
            >
              <BoxArrowUpRight></BoxArrowUpRight>
            </a>
          </div>
        );
      case ITaskItemStatus.ERROR:
        return "error...";
    }
  };

  return (
    <tr>
      <td>{task.uid + 1}</td>
      <td>
        <InputGroup>
          <InputGroup.Text>https://</InputGroup.Text>
          <Form.Control
            type="text"
            value={task.url.replace(/^https:\/\//, "")}
            onChange={(e) => {
              onChange({ ...task, url: "https://" + e.target.value.replace(/^https:\/\//, "")});
            }}
            title="set URL"
            disabled={lock}
          />
        </InputGroup>
      </td>
      <td>
        <InputGroup>
          <Form.Control
            type="number"
            value={task.width}
            onChange={(e) => {
              onChange({ ...task, width: Number(e.target.value) });
            }}
            title="set width"
            disabled={lock}
          />
          <InputGroup.Text>x</InputGroup.Text>
          <Form.Control
            type="number"
            value={task.height}
            onChange={(e) => {
              onChange({ ...task, height: Number(e.target.value) });
            }}
            title="set height"
            disabled={lock}
          />
        </InputGroup>
      </td>
      <td>
        <Form.Control
          type="number"
          value={task.delay}
          onChange={(e) => {
            onChange({ ...task, delay: Number(e.target.value) });
          }}
          title="set delay"
          disabled={lock}
        />
      </td>
      <td>{renderStatus(task)}</td>
      <td>
        <Button onClick={() => onDelete(task)} disabled={lock}>
          <X></X>
        </Button>
      </td>
    </tr>
  );
};

export default TaskItem;
