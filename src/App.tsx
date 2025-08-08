import { useReducer, useRef, useState } from "react";
import "./App.css";
import { Col, Container, Nav, Navbar, Row } from "react-bootstrap";
import TaskList from "./components/TaskList";
import { ITaskItem, ITaskItemStatus } from "./components/TaskItem";
import { BoxArrowUpRight } from "react-bootstrap-icons";
import { ScreenshotCapture } from "simple-website-screenshot-tool";
import { Badge } from "react-bootstrap";
import { version as appVersion } from "../package.json";

function App() {
  const defaultTask: Omit<ITaskItem, "uid"> = {
    url: "",
    width: 1024,
    height: 768,
    delay: 2000,
    status: ITaskItemStatus.PENDING,
  };

  const [lock, setLock] = useState(false);
  const abortController = useRef(new AbortController());

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

  const onCancel = () => abortController.current.abort();

  const onProceedHandler = async () => {
    setLock(true);
    try {
      const capture = new ScreenshotCapture({
        chunkWidth: 300,
        chunkHeight: 300,
      });

      abortController.current = new AbortController();
      const capturer = capture.getScreenshots(
        tasks.map((task) => ({
          signal: abortController.current.signal,
          ...task,
        }))
      );

      for (let [taskIndex, taskItem] of tasks.entries()) {
        dispatchTasks({
          type: "update",
          index: taskIndex,
          value: { ...taskItem, status: ITaskItemStatus.PENDING },
        });
      }

      for (let [taskIndex, taskItem] of tasks.entries()) {
        if (abortController.current.signal.aborted) break;

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
          if (e instanceof DOMException && e.name === "AbortError") {
            dispatchTasks({
              type: "update",
              index: taskIndex,
              value: { ...taskItem, status: ITaskItemStatus.PENDING },
            });
          } else {
            dispatchTasks({
              type: "update",
              index: taskIndex,
              value: { ...taskItem, status: ITaskItemStatus.ERROR },
            });
          }
        }
      }
      capturer.return();
    } finally {
      setLock(false);
    }
  };

  const onResetHandler = () => {
    dispatchTasks({ type: "clear" });
    dispatchTasks({ type: "create", value: defaultTask });
  };

  return (
    <>
      <Navbar bg="dark" className="bg-body-tertiary">
        <Container>
          <Navbar.Brand href="#">
            Simple Bulk Webpage Screenshooter
          </Navbar.Brand>
          <Navbar.Toggle />
          <Navbar.Collapse className="justify-content-end">
            <Navbar.Text>
              <Nav.Link href="https://github.com/olegbarabanov/simple-bulk-webpage-screenshooter">
                Github <BoxArrowUpRight></BoxArrowUpRight>
              </Nav.Link>
            </Navbar.Text>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      <section className="mt-5">
        <Container>
          <Row className="justify-content-center">
            <Col className="col-xl-8 col-lg-10">
              <h1 className="h1 text-center">
                Simple Bulk Webpage Screenshooter
              </h1>
              <p className="text-center">
                <Badge bg="warning" text="dark">
                  v {appVersion}
                </Badge>
              </p>
              <p className="mt-5 text-center">
                A web application for creating multiple screenshots of web pages
                with different parameters.{" "}
                <span className="text-black fw-bolder">
                  No servers. No third-party services.
                </span>{" "}
                A modern browser is enough to create screenshots of web pages.
              </p>
            </Col>
          </Row>
        </Container>
      </section>

      <section className="mt-5">
        <Container>
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
      </section>

      <section className="mt-5">
        <Container>
          <Row className="justify-content-center">
            <Col className="col-xl-8 col-lg-10">
              <p className="text-center">
                2025 © Simple Bulk Webpage Screenshooter by{" "}
                <a href="https://olegbarabanov.ru">olegbarabanov</a>
              </p>
            </Col>
          </Row>
        </Container>
      </section>
    </>
  );
}

export default App;
