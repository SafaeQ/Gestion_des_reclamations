import { lazy, Suspense, useEffect } from "react";
import { useSelector } from "react-redux";
import { Redirect, Switch } from "react-router-dom";
import { ErrorBoundary } from "react-error-boundary";
import type { FallbackProps } from "react-error-boundary";
import { RootState } from "../appRedux/store";
import useSound from "use-sound";
import Authinit from "../containers/Auth/Authinit";
import ProtectedRoute from "../containers/hoc/PrivateRoute";
import TeamLeaderProtectedRoute from "../containers/hoc/PrivateRoute2";
import Spinner from "../containers/Spinner";
import { Complaints, ROLE, User, USER_STATUS } from "../types";
import { Button, Result } from "antd";
import addNotification from "react-push-notification";
import { socket } from "../context/socket.provider";
import pointBlank from "../sounds/point-blank-589.mp3";
import ChefProtectedRoute from "../containers/hoc/ChefPrivateRoute";
import { transport } from "../util/Api";
import { useQuery } from "react-query";
import { toast } from "react-toastify";
import { BellOutlined } from "@ant-design/icons";
import UpdateComplain from "./pages/Complaints/Update";

const Tickets = lazy(async () => await import("./pages/Home"));

enum Scoop {
  MEMBER = "member",
  LEADER = "leader",
  CHEF = "chef",
}

// define application routes
const routes = [
  {
    component: Tickets,
    path: "complaint",
    exact: true,
    scope: Scoop.MEMBER,
  },
  {
    component: UpdateComplain,
    path: "complaints/edit/:id",
    exact: true,
  },
];

function ErrorFallback({ error, resetErrorBoundary }: FallbackProps) {
  console.log(error.message);
  return (
    <Result
      status="error"
      title="Error"
      subTitle="Sorry, something went wrong."
      extra={
        <Button type="primary" onClick={resetErrorBoundary}>
          Back Home
        </Button>
      }
    />
  );
}

const App = () => {
  const [holidaySound] = useSound(pointBlank);

  const isAuthenticated = useSelector<RootState, boolean | undefined>(
    (state) => state.auth.isAuthenticated
  );
  const user = useSelector<RootState, User | undefined>(
    (state) => state.auth.user
  );

  const { data: Complaints } = useQuery<Complaints[]>(
    "Complaints-by-entity",
    async () =>
      await transport
        .post("/complaints/chef", { id: user?.id })
        .then((res) => res.data)
  );

  useEffect(() => {
    socket.emit("user-online", {
      userId: user?.id,
      activity: USER_STATUS.ONLINE,
    });

    // ping if user online
    socket.io.on("ping", () => {
      socket.emit("user-online", {
        userId: user?.id,
        activity: USER_STATUS.ONLINE,
      });
    });

    // notife for complaints is seen
    if (Complaints != null) {
      if (user?.role !== ROLE.CHEF) {
        for (const complaint of Complaints) {
          socket.on(
            `complainSeen-tech-${complaint.user.id}-${complaint.id}`,
            async () => {
              toast(`Your Complain ${complaint.id} was seen  `, {
                icon: <BellOutlined style={{ color: "white" }} />,
                position: "top-right",
                theme: "colored",
                autoClose: 5000,
                progressStyle: { backgroundColor: "#FEA1A1" },
                style: { backgroundColor: "#EC7272", color: "#fff" },
              });
              addNotification({
                title: "Complaints",
                message: `Your Complain ${complaint.id} was seen  `,
                theme: "darkblue",
                duration: 20000000,
                native: true,
              });
              holidaySound();
            }
          );
        }
      }
    }

    return () => {
      if (Complaints != null) {
        for (const complaint of Complaints) {
          socket.off(`complainSeen-tech-${complaint.user.id}-${complaint.id}`);
        }
      }
    };
  }, [socket]);

  return (
    <div>
      <Switch>
        <Suspense fallback={<Spinner />}>
          <Authinit>
            <ErrorBoundary FallbackComponent={ErrorFallback}>
              {routes.map((route) => {
                if (route.scope === Scoop.MEMBER) {
                  return (
                    <ProtectedRoute
                      user={user}
                      isAuthenticated={!!(isAuthenticated ?? false)}
                      key={route.path}
                      exact={route.exact}
                      path={`/${route.path}`}
                      component={route.component}
                    />
                  );
                }
                if (route.scope === Scoop.CHEF) {
                  return (
                    <ChefProtectedRoute
                      user={user}
                      isAuthenticated={!!(isAuthenticated ?? false)}
                      key={route.path}
                      exact={route.exact}
                      path={`/${route.path}`}
                      component={route.component}
                    />
                  );
                }
                return (
                  <TeamLeaderProtectedRoute
                    user={user}
                    isAuthenticated={!!(isAuthenticated ?? false)}
                    key={route.path}
                    exact={route.exact}
                    path={`/${route.path}`}
                    component={route.component}
                  />
                );
              })}
            </ErrorBoundary>
          </Authinit>
        </Suspense>
        <Redirect from="/" to="/complaint" />
      </Switch>
    </div>
  );
};

export default App;
