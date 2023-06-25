import logo from "../../routes/img/adsglory-without-bg.png";
import { footerText } from "../../util/config";
import App from "../../routes/index";
import { updateWindowWidth } from "../../appRedux/actions/settings";
import { ProLayout } from "@ant-design/pro-layout";
import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";
import { Link } from "react-router-dom";
import {
  AuditOutlined,
  DownOutlined,
} from "@ant-design/icons";
import { ROLE, User } from "../../types";
import { RootState } from "../../appRedux/store";
import { transport } from "../../util/Api";
import { Dropdown, Space } from "antd";
import { ItemType } from "rc-menu/lib/interface";
import { setCurrentUser } from "../../appRedux/actions/auth";
import { AwayButton,  } from "../../routes/NotifeItem";

const MainApp = () => {
  const dispatch = useDispatch();

  const user = useSelector<RootState, User | undefined>(
    (state) => state.auth.user
  );

  useEffect(() => {
    window.addEventListener("resize", () => {
      dispatch(updateWindowWidth(window.innerWidth));
    });
  }, [dispatch]);

  const defaultMenus = [
    {
      path: "/complaints",
      name: "Complaints",
      icon: <AuditOutlined />,
      roles: [ROLE.TEAMLEADER, ROLE.CHEF, ROLE.TEAMMEMBER],
    },
  ].filter((item) => item.roles.includes(user?.role as ROLE));

  const items: ItemType[] = [
    {
      key: "1",
      label: "LogOut",
      onClick: () => {
        transport
          .post("/auth/users/support/logout")
          .then(() => {
            dispatch(setCurrentUser({} as unknown as User));
          })
          .catch((err) => console.log(err));
      },
    },
  ];
  return (
    <>
      <ProLayout
        menuItemRender={(menu: any, dom: any) => (
          <Link to={menu.path as string}>{dom}</Link>
        )}
        token={{
          header: {
            colorBgMenuItemSelected: "#ebf8ff",
          },
        }}
        title={"SUPPORT PORTAL".toUpperCase()}
        fixedHeader={true}
        layout="top"
        logo={logo}
        siderMenuType="group"
        locale="en-US"
        disableMobile={true}
        avatarProps={{
          src: "https://gw.alipayobjects.com/zos/antfincdn/efFD%24IOql2/weixintupian_20170331104822.jpg",
          size: "large",
          title: (
            <Dropdown menu={{ items }}>
              <Space>
                {user?.name}
                <DownOutlined />
              </Space>
            </Dropdown>
          ),
        }}
        actionsRender={() => {
          return [
            <AwayButton key={"away"} />,
          ];
        }}
        menuFooterRender={(props: any) => {
          if (props?.collapsed) return undefined;
          return (
            <div style={{ textAlign: "center", paddingBlockStart: 12 }}>
              <div>{footerText}</div>
            </div>
          );
        }}
        route={{ routes: defaultMenus }}
      >
        <App />
      </ProLayout>
    </>
  );
};
export default MainApp;
