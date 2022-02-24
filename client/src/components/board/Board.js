import React, { Component } from 'react'
import './board.css'
import io from 'socket.io-client'

export default class Board extends Component {
    socket = io.connect("http://localhost:5000");
    timeout;
    ctx;
    isDrawing = false;
    constructor(props) {
        super(props);

        this.socket.on("canvas-data", (data) => {
            let root = this;
            const interval = setInterval(() => {
                if (root.isDrawing) return;
                root.isDrawing = true;
                clearInterval(interval);
                let image = new Image();
                const canvas = document.querySelector('#board');
                const ctx = canvas.getContext('2d');
                image.onload = () => {
                    ctx.drawImage(image, 0, 0);
                    root.isDrawing = false;
                }
                image.src = data;
            }, 200)
        })
    }

    componentWillReceiveProps(newProps) {
        this.ctx.lineWidth = newProps.size;
        this.ctx.strokeStyle = newProps.color;
    }

    componentDidMount() {
        this.drawOnCanvas();
    }

    drawOnCanvas = () => {
        const canvas = document.querySelector('#board');
        this.ctx = canvas.getContext('2d');
        const ctx = this.ctx;

        const sketch = document.querySelector('#sketch');
        const sketch_style = getComputedStyle(sketch);
        canvas.width = parseInt(sketch_style.getPropertyValue('width'));
        canvas.height = parseInt(sketch_style.getPropertyValue('height'));

        const mouse = { x: 0, y: 0 };
        const last_mouse = { x: 0, y: 0 };

        canvas.addEventListener('mousemove', function (e) {
            last_mouse.x = mouse.x;
            last_mouse.y = mouse.y;

            mouse.x = e.pageX - this.offsetLeft;
            mouse.y = e.pageY - this.offsetTop;
        }, false);


        ctx.lineWidth = this.props.size;
        ctx.lineJoin = 'round';
        ctx.lineCap = 'round';
        ctx.strokeStyle = this.props.color;

        canvas.addEventListener('mousedown', function (e) {
            canvas.addEventListener('mousemove', onPaint, false);
        }, false);

        canvas.addEventListener('mouseup', function () {
            canvas.removeEventListener('mousemove', onPaint, false);
        }, false);

        let root = this;
        const onPaint = function () {
            ctx.beginPath();
            ctx.moveTo(last_mouse.x, last_mouse.y);
            ctx.lineTo(mouse.x, mouse.y);
            ctx.closePath();
            ctx.stroke();

            // setTimeout: when the user draws after 1 second to send it to another user, it will greatly reduce the bandwidth
            if (root.timeout) clearTimeout(root.timeout);
            root.timeout = setTimeout(() => {
                const base64ImageData = canvas.toDataURL("image/png");
                root.socket.emit("canvas-data", base64ImageData);
            }, 1000)
        };
    }

    render() {
        return (
            <div className="sketch" id="sketch">
                <canvas className="board" id="board"></canvas>
            </div>
        )
    }
}
