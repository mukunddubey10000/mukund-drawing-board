import { actionItemClick } from "@/slice/menuSlice";
import { useEffect, useLayoutEffect, useMemo, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";

const Board = () => {
    const canvasRef = useRef(null);
    const shouldDraw = useRef(false);
    const activeMenuItem = useSelector(state => state.menu.activeMenuItem);
    const { color, size } = useSelector(state => state.toolbox[activeMenuItem]);

    useEffect(() => {
        if (!canvasRef.current)
            return;
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');

        const changeConfig = () => {
            context.strokeStyle = color;
            context.lineWidth = size;
        }
        changeConfig();
    }, [color, size]);

    //coz this runs before useEffect & want to calculate dimensions so do it first
    useLayoutEffect(() => {
        if (!canvasRef.current)
            return;
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');

        //when mounting 
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;


        const handleMouseDown = (e) => {
            shouldDraw.current = true;
            context.beginPath();
        }
        const handleMouseMove = (e) => {
            if (!shouldDraw.current)
                return;
            context.lineTo(e?.clientX, e?.clientY);
            context.stroke();
        }
        const handleMouseUp = (e) => {
            shouldDraw.current = false;
        }
        //Draw when user does mouseDown & continue on mouseMove & only release when mouseUp
        canvas.addEventListener('mousedown', handleMouseDown);
        canvas.addEventListener('mousemove', handleMouseMove);
        canvas.addEventListener('mouseup', handleMouseUp);

        return () => {
            canvas.removeEventListener('mousedown', handleMouseDown);
            canvas.removeEventListener('mousemove', handleMouseMove);
            canvas.removeEventListener('mouseup', handleMouseUp);
        }
    }, []);
    console.log(color, size);
    return (
        <canvas ref={canvasRef}></canvas>
    )
}

export default Board;