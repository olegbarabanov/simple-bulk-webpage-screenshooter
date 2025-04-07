import { useReducer, useState } from "react";
import "./App.css";
import { Col, Container, Navbar, Row } from "react-bootstrap";
import TaskList from "./components/TaskList";
import { ITaskItem, ITaskItemStatus } from "./components/TaskItem";
import { WindowFullscreen } from "react-bootstrap-icons";
import { ScreenshotCapture } from "simple-website-screenshot-tool";

function App() {
  const defaultTask: Omit<ITaskItem, "uid"> = {
    url: "",
    width: 1024,
    height: 768,
    delay: 2000,
    status: ITaskItemStatus.PENDING,
  };

  const [lock, setLock] = useState(false);
  let cancel = false;

  const reducer = (
    state: Array<Omit<ITaskItem, "uid">>,
    action: {
      type: "create" | "update" | "delete" | "clear";
      index?: number;
      value?: Omit<ITaskItem, "uid">;
    }
  ) => {
    if (action.type === "create" && action.value) {
      return [...state, action.value];
    }

    if (action.type === "update") {
      return state.map((task, index) =>
        index === action.index && action.value ? action.value : task
      );
    }

    if (action.type === "delete") {
      return state.filter((_task, index) => index !== action.index);
    }

    if (action.type === "clear") {
      return [];
    }

    return state;
  };

  const [tasks, dispatchTasks] = useReducer(reducer, [defaultTask]);

  const onCreateHandler = () => {
    dispatchTasks({ type: "create", value: defaultTask });
  };

  const onChangeHandler = (updatedTask: ITaskItem) => {
    dispatchTasks({
      type: "update",
      index: updatedTask.uid,
      value: updatedTask,
    });
  };

  const onDeleteHandler = (deletedTask: ITaskItem) => {
    dispatchTasks({ type: "delete", index: deletedTask.uid });
  };

  const onCancel = () => {
    cancel = true;
  };

  const onProceedHandler = async () => {
    setLock(true);
    try {
      const capture = new ScreenshotCapture({
        chunkWidth: 300,
        chunkHeight: 300,
      });

      const capturer = capture.getScreenshots(tasks);

      for (let [taskIndex, taskItem] of tasks.entries()) {
        dispatchTasks({
          type: "update",
          index: taskIndex,
          value: { ...taskItem, status: ITaskItemStatus.PENDING },
        })
      }

      for (let [taskIndex, taskItem] of tasks.entries()) {
        if (cancel) {
          setLock(false);
          cancel = false;
          break;
        }

        dispatchTasks({
          type: "update",
          index: taskIndex,
          value: { ...taskItem, status: ITaskItemStatus.PROCEED },
        });
        try {
          const { done, value } = await capturer.next();
          if (done) break;
          dispatchTasks({
            type: "update",
            index: taskIndex,
            value: { ...taskItem, status: ITaskItemStatus.DONE, blob: value },
          });
        } catch (e) {
          dispatchTasks({
            type: "update",
            index: taskIndex,
            value: { ...taskItem, status: ITaskItemStatus.ERROR },
          });
        }
      }
      capturer.return();
    } finally {
      setLock(false);
      cancel = false;
    }
  };

  const onResetHandler = () => {
    dispatchTasks({ type: "clear" });
    dispatchTasks({ type: "create", value: defaultTask });
  };

  return (
    <Container fluid="sm" className="mx-auto">
      <Row>
        <Col>
          <Navbar expand="lg" className="bg-body-tertiary">
            <Container>
              <Navbar.Brand href="#">
                <WindowFullscreen className="me-2" size="36"></WindowFullscreen>
                Simple Bulk Webpage Screenshooter (v 0.0.1)
              </Navbar.Brand>
            </Container>
          </Navbar>
        </Col>
      </Row>
      <Row>
        <Col xs={12}>
          <TaskList
            tasks={tasks.map((item, index) => {
              return { ...item, uid: index + 1 };
            })}
            lock={lock}
            onChange={onChangeHandler}
            onCreate={onCreateHandler}
            onDelete={onDeleteHandler}
            onProceed={onProceedHandler}
            onReset={onResetHandler}
            onCancel={onCancel}
          ></TaskList>
        </Col>
      </Row>
    </Container>
  );
}

export default App;
