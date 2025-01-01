import { actionItemClick } from "@/slice/menuSlice";
import { useEffect, useMemo, useRef } from "react";
import { useDispatch } from "react-redux";

const Board = () => {
    const canvasRef = useRef(null);
    // const dispatch = useDispatch();

    useEffect(() => {
        if (!canvasRef.current)
            return;
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');

        //when mounting 
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }, []);

    return (
        <canvas ref={canvasRef}></canvas>
    )
}

export default Board;