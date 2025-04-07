import { Button, Card, CardBody, Table } from "react-bootstrap";
import TaskItem, { ITaskItem } from "./TaskItem";
import { PlayCircle, PlusSquare, X } from "react-bootstrap-icons";

interface TaskListOptions {
  tasks: Array<ITaskItem>;
  lock: boolean;
  onChange?: (item: ITaskItem) => void;
  onDelete?: (item: ITaskItem) => void;
  onCreate?: () => void;
  onProceed?: () => void;
  onCancel?: () => void;
  onReset?: () => void;
}

export default function TaskList({
  tasks,
  lock = false,
  onChange = () => {},
  onDelete = () => {},
  onCreate = () => {},
  onProceed = () => {},
  onCancel = () => {},
  onReset = () => {},
}: TaskListOptions): React.JSX.Element {
  const cols = [
    "#",
    "url",
    "device width & height",
    "delay (milliseconds)",
    "status",
    "...",
  ];
  return (
    <Card>
      <Card.Header>
        <div className="d-flex gap-2">
          <Button variant="secondary" onClick={onCreate} disabled={lock}>
            <PlusSquare className="me-2"></PlusSquare>
            <span>Add URL</span>
          </Button>
          <Button variant="secondary" onClick={onReset} disabled={lock}>
            <X className="me-2"></X>
            <span>Reset</span>
          </Button>
          {lock ? (
            <Button variant="secondary" onClick={onCancel}>
              <PlayCircle className="me-2"></PlayCircle>
              <span>Cancel</span>
            </Button>
          ) : (
            <Button variant="secondary" onClick={onProceed} disabled={lock}>
              <PlayCircle className="me-2"></PlayCircle>
              <span>Proceed</span>
            </Button>
          )}
        </div>
      </Card.Header>
      <CardBody>
        <Table>
          <thead>
            <tr>
              {cols.map((col) => (
                <th>{col}</th>
              ))}
            </tr>
          </thead>

          <tbody>
            {tasks.map((item, index) => (
              <TaskItem
                key={item.uid}
                lock={lock}
                task={{ ...item, uid: index }}
                onChange={onChange}
                onDelete={onDelete}
              ></TaskItem>
            ))}
          </tbody>
        </Table>
      </CardBody>
    </Card>
  );
}
