window.addEventListener('DOMContentLoaded', main)

function main() {
    console.log('start')

    const canvas = document.getElementById('canvas')
    const ctx = canvas.getContext('2d')

    ctx.moveTo(0,0)
    ctx.lineTo(255, 255)
    ctx.strokeStyle = 'red'
    ctx.stroke()

    console.log('done')
}