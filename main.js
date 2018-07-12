const scl = 1, dimX = 1000, dimY = 1000

function computeMandelBrot(dimX = 200, dimY = 200, x_min = -1.5, y_min = -1.5, x_max = 1.5, y_max = 1.5, maxIter = 200){
    const x = []
    const y = []
    for (let ix = 0; ix < dimX; ix++) {
        for (let iy = 0; iy < dimY; iy++) {
            x.push(ix / dimX * (x_max - x_min) + x_min)
            y.push(iy / dimY * (y_max - y_min) + y_min)
        }
    }
    let returnVal
    tf.tidy(()=>{
        const steps = tf.variable(tf.zeros([dimX, dimY]))
        const reX = tf.tensor2d(x, [dimX, dimY])
        const imX = tf.tensor2d(y, [dimX, dimY])
        const reZ = tf.variable(reX)
        const imZ = tf.variable(imX)
        const _reZ = tf.variable(reX)
        const _imZ = tf.variable(imX)
        const non_div = tf.variable(tf.zerosLike(reZ))
        for (let step = 0; step < maxIter; step++) {
            _reZ.assign(
                reZ.square().sub(imZ.square()).add(reX)
            )
            _imZ.assign(
                reZ.mul(imZ).mul(tf.scalar(2)).add(imX)
            )
            reZ.assign(_reZ)
            imZ.assign(_imZ)
            non_div.assign(reZ.square().add(imZ.square()).greater(tf.scalar(16)).cast("float32"))
            steps.assign(steps.add(non_div))
        }
        steps.assign(steps.div(tf.scalar(maxIter)))
        reZ.dispose()
        imZ.dispose()
        _reZ.dispose()
        _imZ.dispose()
        non_div.dispose()
        returnVal = steps.dataSync()
        steps.dispose()
    })
    return returnVal
}


function drawMandelBrot(left = -1.5, top = -1.5, right = 1.5, bottom = 1.5, maxIter = 100){
    const data = Array.from(computeMandelBrot(dimX, dimY, left, top, right, bottom, maxIter))
    _min = mymin(data)
    _max = mymax(data)
    img = createImage(dimX, dimY);
    img.loadPixels();
    for (let x = 0; x < dimX; x++) {
        for (let y = 0; y < dimY; y++) {
            let col = map(sqrt(data[y + x* dimX]), sqrt(_min), sqrt(_max), 0, 255)
            // let col = map(random(1), 0, 1, 0, 255)
            img.set(x, y, [col, col, col, 255])
            // let pix = (x+y * width) * 4
            // pixels[pix + 0] = col
            // pixels[pix + 1] = col 
            // pixels[pix + 2] = col 
            // pixels[pix + 3] = 255 
        }
    }
    img.updatePixels();
    image(img, 0, 0)
    console.log(tf.memory())
}

let x1 = 0
let x2 = 0
let y1 = 0
let y2 = 0
let x_min = -2.05
let y_min = -1.3
let x_max = 0.6
let y_max = 1.3
let maxIter = 15

function setup(){
    let cnv = createCanvas(dimX * scl, dimY * scl)
    cnv.parent('container')
    // cnv.style('display', 'block');
    drawMandelBrot(x_min, y_min, x_max, y_max, maxIter)
}

function mouseClicked() {
    if(mouseX > width || mouseY > height || mouseX < 0 || mouseY < 0)
        return
    const x1 = map(mouseX, 0, width, x_min, x_max)
    const y1 = map(mouseY, 0, height, y_min, y_max)
    const currW = x_max - x_min
    const currH = y_max - y_min
    x_min = x1 - currW / 4 
    x_max = x_min + currW / 2
    y_min = y1 - currH / 4 
    y_max = y_min + currH / 2
    drawMandelBrot(x_min, y_min, x_max, y_max, maxIter)
}

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById("maxIterations").addEventListener("change", () => {
        maxIter = document.getElementById("maxIterations").value
        drawMandelBrot(x_min, y_min, x_max, y_max, maxIter)
    });
})


function mymin(arr){
    return arr.reduce((accumulator, currentValue)=>{
        if(accumulator < currentValue){
            return accumulator
        } else {
            return currentValue
        }
    }, Number.MAX_VALUE)
}

function mymax(arr){
    return arr.reduce((accumulator, currentValue)=>{
        if(accumulator > currentValue){
            return accumulator
        } else {
            return currentValue
        }
    }, Number.MIN_VALUE)
}
