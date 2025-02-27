import { useState, useEffect, useLayoutEffect, useRef } from "react";
import { useSelector, useDispatch } from 'react-redux';
import { SketchPicker } from 'react-color';
import { MENU_ITEMS } from "../constants";
import { actionItemClick } from '@/slice/menuSlice';
import { socket } from "@/socket";

const Board = () => {
    const dispatch = useDispatch();
    const canvasRef = useRef(null);
    const layoutHistory = useRef([]);  // Stores individual drawing actions
    const historyPointer = useRef(0);  // Pointer for undo/redo
    const shouldDraw = useRef(false);
    const { activeMenuItem, actionMenuItem } = useSelector((state) => state.menu);
    const { color, size } = useSelector((state) => state.toolbox[activeMenuItem]);

    const [bgColor, setBgColor] = useState("#AAA111");  // Default to orange

    // Handle background color change and drawing actions
    useEffect(() => {
        if (!canvasRef.current) return;
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');

        // Set background color and redraw layout
        context.fillStyle = bgColor;
        context.fillRect(0, 0, canvas.width, canvas.height);
        reDrawWholeLayout(context);

        // Handle other actions like download or undo/redo
        if (actionMenuItem === MENU_ITEMS.DOWNLOAD) {
            const URL = canvas.toDataURL();
            const anchor = document.createElement('a');
            anchor.href = URL;
            anchor.download = 'sketch.jpg';
            anchor.click();
        } else if (actionMenuItem === MENU_ITEMS.UNDO || actionMenuItem === MENU_ITEMS.REDO) {
            handleUndoRedo(context);
        }

        // Reset actionItemClick state after handling actions
        dispatch(actionItemClick(null));
    }, [actionMenuItem, dispatch, bgColor]);

    // Handle undo/redo logic
    const handleUndoRedo = (context) => {
        if (actionMenuItem === MENU_ITEMS.UNDO && historyPointer.current > 0) {
            historyPointer.current -= 1;
        }
        if (actionMenuItem === MENU_ITEMS.REDO && historyPointer.current < layoutHistory.current.length - 1) {
            historyPointer.current += 1;
        }
        const currentHistory = layoutHistory.current[historyPointer.current];
        if (currentHistory) {
            context.clearRect(0, 0, context.canvas.width, context.canvas.height); // Clear the canvas
            reDrawWholeLayout(context); // Redraw all actions up to this point
        }
    };

    // Store drawing configuration and listen to socket changes
    useEffect(() => {
        if (!canvasRef.current) return;
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');

        const changeConfig = (color, size) => {
            context.strokeStyle = color;
            context.lineWidth = size;
        };

        const handleChangeConfig = (config) => {
            changeConfig(config.color, config.size);
        };

        changeConfig(color, size);
        socket.on('changeConfig', handleChangeConfig);

        return () => {
            socket.off('changeConfig', handleChangeConfig);
        };
    }, [color, size]);

    // Handle drawing logic
    useLayoutEffect(() => {
        if (!canvasRef.current) return;
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');

        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        const beginPath = (x, y) => {
            context.beginPath();
            context.moveTo(x, y);
            layoutHistory.current.push({ type: 'beginPath', x, y });
        };

        const drawLine = (x, y) => {
            context.lineTo(x, y);
            context.stroke();
            layoutHistory.current.push({ type: 'drawLine', x, y });
        };

        const handleMouseDown = (e) => {
            shouldDraw.current = true;
            beginPath(e.clientX, e.clientY);
            socket.emit('beginPath', { x: e.clientX, y: e.clientY });
        };

        const handleMouseMove = (e) => {
            if (!shouldDraw.current) return;
            drawLine(e.clientX, e.clientY);
            socket.emit('drawLine', { x: e.clientX, y: e.clientY });
        };

        const handleMouseUp = () => {
            shouldDraw.current = false;
            historyPointer.current = layoutHistory.current.length - 1; // Update the history pointer
        };

        canvas.addEventListener('mousedown', handleMouseDown);
        canvas.addEventListener('mousemove', handleMouseMove);
        canvas.addEventListener('mouseup', handleMouseUp);

        canvas.addEventListener('touchstart', handleMouseDown);
        canvas.addEventListener('touchmove', handleMouseMove);
        canvas.addEventListener('touchend', handleMouseUp);

        socket.on('beginPath', (path) => beginPath(path.x, path.y));
        socket.on('drawLine', (path) => drawLine(path.x, path.y));

        return () => {
            canvas.removeEventListener('mousedown', handleMouseDown);
            canvas.removeEventListener('mousemove', handleMouseMove);
            canvas.removeEventListener('mouseup', handleMouseUp);

            canvas.removeEventListener('touchstart', handleMouseDown);
            canvas.removeEventListener('touchmove', handleMouseMove);
            canvas.removeEventListener('touchend', handleMouseUp);

            socket.off('beginPath', beginPath);
            socket.off('drawLine', drawLine);
        };
    }, []);

    // Redraw the entire layout from history upto current history pointer
    // modify pointer only -> do not modify layoutHistory itself
    const reDrawWholeLayout = (context) => {
        for (let i = 0; i < historyPointer.current; i++) {
            const ele = layoutHistory.current[i];
            if (ele.type === 'beginPath') {
                context.beginPath();
                context.moveTo(ele.x, ele.y);
            } else if (ele.type === 'drawLine') {
                context.lineTo(ele.x, ele.y);
                context.stroke();
            }
        }
    };

    const handleColorChange = (color) => {
        setBgColor(color.hex);
    };

    return (
        <div style={{ display: 'flex', flex: 1 }}>
            <div style={{
                position: 'absolute',
                bottom: '0.5rem',
                left: '0.5rem',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                flexDirection: 'column',
                backgroundColor: 'grey'
            }}>
                <div>Select Background Color</div>
                <SketchPicker color={bgColor} onChangeComplete={handleColorChange} />
            </div>

            <canvas ref={canvasRef}></canvas>
        </div>
    );
};

export default Board;

/**
 * Issues / Future plans
 * 2) Persist the lines when background color is changed [HIGH] -> Bug -> UNDO/REDO not working
 * 3) Add warning or error toasts when user does something bad like undo/redo 
 *      when not allowed -> System design seekh lega aise [HIGH PRIORITY]
 * 1) Emit background changes (or not?)
 * 4) Have nudges for background color selecyion / toolBox & open them on hover or clicks
 *      & animate this process
 * 5) Let this be an infinite scrollable page -> Add scroll event listener & keep
 *      changing height of the canvas ? Or find some better approach
 */