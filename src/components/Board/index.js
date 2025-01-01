import { actionItemClick } from "@/slice/menuSlice";
import { useEffect, useLayoutEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { COLORS, MENU_ITEMS } from "../constants";

const Board = () => {
    const canvasRef = useRef(null);
    const shouldDraw = useRef(false);
    const { activeMenuItem, actionMenuItem } = useSelector(state => state.menu);
    const { color, size } = useSelector(state => {
        return state.toolbox[activeMenuItem] || {}
    });
    const dispatch = useDispatch();

    useEffect(() => {
        if (!canvasRef.current)
            return;
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');
        if (actionMenuItem === MENU_ITEMS.DOWNLOAD) {
            const URL = canvas.toDataURL(); //convert canvas into an image
            // console.log('Mukund URL image = ', URL);
            const anchor = document.createElement('a');
            anchor.href = URL;
            anchor.download = 'mukund_drawing_board.jpg';
            anchor.click();

            //coz this useeffect triggers on actionMenuItem change but on 2nd download 
            //button click it will not download file again
            dispatch(actionItemClick(null));
        }
    }, [actionMenuItem]);

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