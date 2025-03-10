import { useDispatch, useSelector } from "react-redux";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faEraser, faFileArrowDown, faPencil, faRotateLeft, faRotateRight } from "@fortawesome/free-solid-svg-icons";
import cx from 'classnames';
import styles from "./index.module.css";

import { MENU_ITEMS } from "../constants";
import { menuItemClick, actionItemClick } from "@/slice/menuSlice";
import useNotification from "@/hooks/useNotification";

const Menu = () => {
    const dispatch = useDispatch();
    const activeMenuItem = useSelector(state => state.menu.activeMenuItem);

    //custom hooks
    const { Notification, triggerNotification } = useNotification();

    const handleMenuClick = (itemName) => {
        dispatch(menuItemClick(itemName));
    };
    const handleMenuActionClick = (itemName) => {
        // if (itemName === MENU_ITEMS.UNDO) {
        //     triggerNotification({ duration: 1000, message: "UNDO" });
        // }
        dispatch(actionItemClick(itemName));
    }

    return (
        <div className={styles.menuContainer}>
            <div className={cx(styles.iconWrapper, { [styles.active]: activeMenuItem === MENU_ITEMS.PENCIL })} onClick={() => handleMenuClick(MENU_ITEMS.PENCIL)}>
                <FontAwesomeIcon icon={faPencil} className={styles.icon} />
            </div>
            <div className={cx(styles.iconWrapper, { [styles.active]: activeMenuItem === MENU_ITEMS.ERASER })} onClick={() => handleMenuClick(MENU_ITEMS.ERASER)}>
                <FontAwesomeIcon icon={faEraser} className={styles.icon} />
            </div>
            <div className={cx(styles.iconWrapper, { [styles.active]: activeMenuItem === MENU_ITEMS.REDO })} onClick={() => handleMenuActionClick(MENU_ITEMS.REDO)} >
                <FontAwesomeIcon icon={faRotateRight} className={styles.icon} />
            </div>
            <div className={cx(styles.iconWrapper, { [styles.active]: activeMenuItem === MENU_ITEMS.UNDO })} onClick={() => handleMenuActionClick(MENU_ITEMS.UNDO)} >
                <FontAwesomeIcon icon={faRotateLeft} className={styles.icon} />
            </div>
            <div className={cx(styles.iconWrapper, { [styles.active]: activeMenuItem === MENU_ITEMS.DOWNLOAD })} onClick={() => handleMenuActionClick(MENU_ITEMS.DOWNLOAD)} >
                <FontAwesomeIcon icon={faFileArrowDown} className={styles.icon} />
            </div>
        </div>
    )
}

export default Menu