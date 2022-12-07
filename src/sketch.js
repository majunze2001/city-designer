// variable to hold a reference to our A-Frame world
let world;
// world has 100 * 100 floor

// dynamic texture buffer for the control panel for 2D map
let buffer;

// mouse click control for placing items
let mouseCooldown = false;

// our robot array
let robots = [];

let buildings = [];
let roads = [];

let house;
let container;

//cells in the map to enable "snapping to the center"
const CELLSIZE = 16;

const metaData = {
    office: {
        width: 12.94276123046875 * 2,
        height: 5.017404296875001 * 2,
        depth: 6.608043945312501 * 2,
        scaleX: 0.002 * 2,
        scaleY: 0.002 * 2,
        scaleZ: 0.002 * 2,
        color: 'blue',
    },
    apartment: {
        width: 5.58 * 2,
        height: 16.1351787109375 * 2,
        depth: 5.580000000000004 * 2,
        scaleX: 0.001 * 2,
        scaleY: 0.001 * 2,
        scaleZ: 0.001 * 2,
        color: 'green',
    },
    hotel: {
        width: 6.66590234375 * 2,
        height: 16.248599609375 * 2,
        depth: 5.1300000000000034 * 2,
        scaleX: 0.001 * 2,
        scaleY: 0.001 * 2,
        scaleZ: 0.001 * 2,
        color: 'yellow',
    },
    school: {
        width: 7.796965147803192 * 2,
        height: 1.3818419276179088 * 2,
        depth: 6.61837641158769 * 2,
        scaleX: 3 * 2,
        scaleY: 3 * 2,
        scaleZ: 3 * 2,
        color: 'white',
    },
    park: {
        width: 7.896933855929955 * 2,
        height: 1.8862671117854113 * 2,
        depth: 10.311207760524983 * 2,
        scaleX: 0.15 * 2,
        scaleY: 0.15 * 2,
        scaleZ: 0.15 * 2,
        color: 'orange',
    },
    stadium: {
        width: 7.272684335708618 * 2,
        height: 2.9066975116729736 * 2,
        depth: 7.316898584365845 * 2,
        scaleX: 2 * 2,
        scaleY: 2 * 2,
        scaleZ: 2 * 2,
        color: 'pink',
    },
};

const brick = {
    road: { width: 100 / (512 / CELLSIZE), height: 100 / (512 / CELLSIZE), color: 'grey' },
    turn: { width: 100 / (512 / CELLSIZE), height: 100 / (512 / CELLSIZE), color: 'grey' },
};

let music;
let bgm;
let choice = 'road';
let mode = 1;
let previewContainer;

function preload() {
    music = loadSound('assets/sounds/bubble.mp3');
    bgm = loadSound('assets/sounds/SimCity.mp3');
    // need bgm
}

function mouseClicked() {
    if (house) {
        const t = getDimensions(house.tag.object3D);
        console.log(t);
    }
}

function setup() {
    // no canvas needed
    noCanvas();

    // construct the A-Frame world
    world = new World('VRScene');

    // have the user floating above the world
    world.setUserPosition(0, 25, 1);

    const sky = new Sky({
        asset: 'sky',
    });
    world.add(sky);

    // floor for placing the buildings
    let floor = new Plane({
        width: 100,
        height: 100,
        asset: 'grass',
        repeatX: 100,
        repeatY: 100,
        rotationX: -90,
    });
    world.add(floor);

    // sample
    house = new GLTF({
        asset: 'stadium',
        x: 2,
        y: 0,
        z: -5,
        scaleX: 2,
        scaleY: 2,
        scaleZ: 2,
    });
    world.add(house);

    // box.add(house);
    // world.add(box);

    // 2d map editor
    // create a control panel that the user can click on

    // create our off screen graphics buffer & texture for panel
    buffer = createGraphics(512, 512);
    texture = world.createDynamicTextureFromCreateGraphics(buffer);

    let panel = new Plane({
        width: 5,
        height: 5,
        x: 0,
        y: 25,
        z: -5,
        dynamicTexture: true,
        asset: texture,
        dynamicTextureWidth: 512,
        dynamicTextureHeight: 512,
        overFunction: function (entity, intersectionInfo) {
            // intersectionInfo is an object that contains info about how the user is
            // interacting with this entity.  it contains the following info:
            // .distance : a float describing how far away the user is
            // .point3d : an object with three properties (x, y & z) describing where the user is touching the entity
            // .point2d : an object with two properties (x & y) describing where the user is touching the entity in 2D space (essentially where on the dynamic canvas the user is touching)
            // .uv : an object with two properties (x & y) describing the raw textural offset (used to compute point2d)
            console.log('hello');
            let cellX = parseInt(intersectionInfo.point2d.x / CELLSIZE);
            let cellY = parseInt(intersectionInfo.point2d.y / CELLSIZE);
            console.log(cellX, cellY);

            if (mode) {
                if (Object.hasOwn(brick,choice)) {
                    //collision detection
                    // let w = map(brick[choice].width, 0, 100, 0, 512);
                    // let h = map(brick[choice].height, 0, 100, 0, 512);
                    let w = CELLSIZE;
                    let h = CELLSIZE;

                    let road_X = cellX * CELLSIZE + CELLSIZE / 2;
                    let road_Y = cellY * CELLSIZE + CELLSIZE / 2;

                    if (getPreviewRotation() % 180 !== 0) {
                        const t = w;
                        w = h;
                        h = t;
                    }
                    const pointsOffsets = [
                        [0, 0],
                        [w / 2 - 1, h / 2 - 1],
                        [w / 2 - 1, -h / 2 + 1],
                        [-w / 2 + 1, h / 2 - 1],
                        [-w / 2 + 1, -h / 2 + 1],
                    ];

                    const colors = pointsOffsets.map(([x, y]) => buffer.get(road_X + x, road_Y + y));
                    const colored = colors.filter((c) => !c.every((value, index) => value === [0, 0, 0, 255][index]));

                    if (colored.length > 0) {
                        buffer.fill('red');
                        buffer.rectMode(CENTER);
                        buffer.rect(road_X, road_Y, CELLSIZE, h);
                    } else {
                        // adding
                        buffer.fill(brick[choice].color);
                        buffer.rectMode(CENTER);
                        buffer.rect(road_X, road_Y, w, h);
                        // if the mouse is currently pressed we should create a Robot here on the floor
                        if (mouseIsPressed && !mouseCooldown) {
                            mouseCooldown = true;
                            roads.push(new Road(road_X, road_Y));
                            setTimeout(() => (mouseCooldown = false), 100);
                        }
                    }
                } else {
                    // collision detecting
                    let w = map(metaData[choice].width, 0, 100, 0, 512);
                    let h = map(metaData[choice].depth, 0, 100, 0, 512);

                    if (getPreviewRotation() % 180 !== 0) {
                        const t = w;
                        w = h;
                        h = t;
                    }
                    const pointsOffsets = [
                        [0, 0],
                        [w / 2, h / 2],
                        [w / 2, -h / 2],
                        [-w / 2, h / 2],
                        [-w / 2, -h / 2],
                    ];
                    // get the colors of all detect positions
                    const colors = pointsOffsets.map(([x, y]) => buffer.get(intersectionInfo.point2d.x + x, intersectionInfo.point2d.y + y));
                    const colored = colors.filter((c) => !c.every((value, index) => value === [0, 0, 0, 255][index]));
                    if (colored.length > 0) {
                        // collision
                        buffer.fill('red');
                        buffer.rectMode(CENTER);
                        buffer.rect(intersectionInfo.point2d.x, intersectionInfo.point2d.y, w, h);
                    } else {
                        // adding
                        buffer.fill(metaData[choice].color);
                        buffer.rectMode(CENTER);
                        buffer.rect(intersectionInfo.point2d.x, intersectionInfo.point2d.y, w, h);
                        // if the mouse is currently pressed we should create a Robot here on the floor
                        if (mouseIsPressed && !mouseCooldown) {
                            mouseCooldown = true;
                            buildings.push(
                                new Building(
                                    intersectionInfo.point2d.x,
                                    intersectionInfo.point2d.y,
                                    choice,
                                    metaData[choice].scaleX,
                                    metaData[choice].scaleY,
                                    metaData[choice].scaleZ,
                                    metaData[choice].color,
                                    getPreviewRotation()
                                )
                            );
                            setTimeout(() => (mouseCooldown = false), 1000);
                        }
                    }
                }
            } else {
                //removing
                buffer.fill(255, 0, 0);
                buffer.rectMode(CENTER);
                buffer.rect(intersectionInfo.point2d.x, intersectionInfo.point2d.y, 20, 20);

                if (mouseIsPressed) {
                    buildings.forEach((b, i) => {
                        const w = map(metaData[b.asset].width, 0, 100, 0, 512);
                        const h = map(metaData[b.asset].depth, 0, 100, 0, 512);
                        // just for easy, consider them as circles
                        const r = h - (h >> 2) + (w >> 2);
                        let bufferX = map(b.x, -50, 50, 0, 512);
                        let bufferY = map(b.z, -50, 50, 0, 512);
                        const d = dist(intersectionInfo.point2d.x, intersectionInfo.point2d.y, bufferX, bufferY);
                        if (d <= r + 10) {
                            console.log('found');
                            b.removeFromWorld();
                            buildings.splice(i, 1);
                            return;
                        }
                    });
                    roads.forEach((b, i) => {
                        const w = CELLSIZE;
                        const h = CELLSIZE;
                        // just for easy, consider them as circles
                        const r = h - (h >> 2) + (w >> 2);
                        let bufferX = map(b.x, -50, 50, 0, 512);
                        let bufferY = map(b.z, -50, 50, 0, 512);
                        const d = dist(intersectionInfo.point2d.x, intersectionInfo.point2d.y, bufferX, bufferY);
                        if (d <= r + 10) {
                            console.log('found');
                            b.removeFromWorld();
                            roads.splice(i, 1);
                            return;
                        }
                    });
                }
            }
        },
    });
    world.add(panel);

    //  UI

    // preview
    previewContainer = new Container3D({
        x: -5,
        y: 23.5,
        z: -5,
    });
    world.add(previewContainer);

    displayPreview();

    // rotate button
    const rotateLeftBtn = new Tetrahedron({
        x: -6,
        y: 22.5,
        z: -5,
        radius: 0.5,
        red: 0,
        green: 0,
        blue: 255,
        enterFunction: function (entity) {
            entity.setScale(1.5, 1.5, 1.5);
        },
        leaveFunction: function (entity) {
            entity.setScale(1, 1, 1);
        },
        clickFunction: function (entity) {
            console.log(`rotateLeftBtn clicked`);
            if (previewContainer.getChildren()[0]) {
                console.log('spin');

                if (Object.hasOwn(brick,choice)) {
                    previewContainer.getChildren()[0].spinZ(-90);
                } else {
                    previewContainer.getChildren()[0].spinY(-90);
                }
            }
        },
    });

    const rotateRightBtn = new Tetrahedron({
        x: -4.5,
        y: 22.5,
        z: -5,
        radius: 0.5,
        red: 0,
        green: 0,
        blue: 255,
        enterFunction: function (entity) {
            entity.setScale(1.5, 1.5, 1.5);
        },
        leaveFunction: function (entity) {
            entity.setScale(1, 1, 1);
        },
        clickFunction: function (entity) {
            console.log(`rotateRightBtn clicked`);
            if (Object.hasOwn(brick,choice)) {
                previewContainer.getChildren()[0].spinZ(90);
            } else {
                previewContainer.getChildren()[0].spinY(90);
            }
        },
    });

    world.add(rotateLeftBtn);
    world.add(rotateRightBtn);

    // display choices
    const startPos = { x: 3, y: 27, z: -5 };

    Object.entries(metaData).forEach(([key, data]) => {
        const c = color(data.color);
        const btn = new Plane({
            width: 0.5,
            height: 0.5,
            x: startPos.x,
            y: startPos.y,
            z: startPos.z,
            red: red(c),
            green: green(c),
            blue: blue(c),
            enterFunction: function (entity) {
                entity.setScale(1.5, 1.5, 1.5);
            },
            leaveFunction: function (entity) {
                entity.setScale(1, 1, 1);
            },
            clickFunction: function (entity) {
                console.log(`${key} btn clicked`);
                choice = key;
                displayPreview();
                mode = 1;
            },
        });

        const name = new Text({
            text: key,
            red: 0,
            green: 0,
            blue: 0,
            x: 0.8,
            scaleX: 5,
            scaleY: 5,
            scaleZ: 5,
        });
        btn.add(name);
        startPos.y -= 0.5;
        world.add(btn);
    });

    // const startPos = { x: 3, y: 27, z: -5 };

    startPos.x = 5;
    startPos.y = 27;

    Object.entries(brick).forEach(([key, data]) => {
        const c = color(data.color);
        const btn = new Plane({
            width: 0.5,
            height: 0.5,
            asset:key,
            x: startPos.x,
            y: startPos.y,
            z: startPos.z,
            red: red(c),
            green: green(c),
            blue: blue(c),
            enterFunction: function (entity) {
                entity.setScale(1.5, 1.5, 1.5);
            },
            leaveFunction: function (entity) {
                entity.setScale(1, 1, 1);
            },
            clickFunction: function (entity) {
                console.log(`${key} btn clicked`);
                choice = key;
                displayPreview();
                mode = 1;
            },
        });

        const name = new Text({
            text: key,
            red: 0,
            green: 0,
            blue: 0,
            x: 0.8,
            scaleX: 5,
            scaleY: 5,
            scaleZ: 5,
        });
        btn.add(name);
        startPos.y -= 0.5;
        world.add(btn);
    });

    // when clicked this will remove all buildings from the world
    let clearButton = new Sphere({
        red: 255,
        green: 0,
        blue: 0,
        radius: 0.25,
        x: -1,
        y: 23,
        z: -3,
        clickFunction: function (entity) {
            while (buildings.length > 0) {
                buildings[0].removeFromWorld();
                buildings.splice(0, 1);
            }
            while (roads.length >0){
                roads[0].removeFromWorld();
                road.splice(0,1);
            }
        },
    });
    world.add(clearButton);

    const editButton = new Box({
        red: 0,
        green: 255,
        blue: 0,
        width: 0.5,
        height: 0.5,
        depth: 0.5,
        x: 1,
        y: 23,
        z: -3,
        clickFunction: function (entity) {
            mode ^= 1;
        },
    });
    world.add(editButton);

    bgm.play();

    // const door = new Ring({
    //     x: 50,
    //     y: 0,
    //     z: -18,
    //     radiusInner: 6,
    //     radiusOuter: 8,
    //     side: 'double',
    //     red: random(255),
    //     green: random(255),
    //     blue: random(255),
    //     rotationY: 90,
    // });
    // world.add(door);
}

function draw() {
    buffer.clear();
    buffer.background(0);
    for (const b of buildings) {
        b.displayControlPanel();
    }

    // console.log(world.camera.cameraEl.object3D.rotation);
    // robots.forEach((b) => {
    //     b.updateControlPanel();
    //     b.move();
    // });
    // if (frameCount % 30 === 0) {
    //     robots.push(new Robot());
    // }
    // robots = robots.filter((r) => r.x <= 50);

    for (let i = 0; i < roads.length; i++) {
        roads[i].updateControlPanel();
    }

    const cameraWindow = document.querySelector('iframe')?.contentWindow;
    if (cameraWindow && cameraWindow.addHiro) {
        console.log('I should do something here');
        cameraWindow.addHiro = false;
    }
}

// helpers for preview

function displayPreview() {
    while (previewContainer.getChildren()[0]) {
        previewContainer.removeChild(previewContainer.getChildren()[0]);
    }
    if (Object.hasOwn(brick,choice) ) {
        const previewModel = new Plane({
            asset: choice,
        });
        previewContainer.addChild(previewModel);
    } else {
        const previewModel = new GLTF({
            asset: choice,
            scaleX: metaData[choice].scaleX / 8,
            scaleY: metaData[choice].scaleY / 8,
            scaleZ: metaData[choice].scaleZ / 8,
        });
        previewContainer.addChild(previewModel);
    }
}
function getPreviewRotation() {
    return Object.hasOwn(brick,choice) ? previewContainer.getChildren()[0].getRotationZ() : previewContainer.getChildren()[0].getRotationY();
}

class Road {
    constructor(_x, _z) {
        // convert from buffer coords (512x512) to world coords (100x100)
        this.x = map(_x, 0, 512, -50, 50);
        this.z = map(_z, 0, 512, -50, 50);
        this.length = map(CELLSIZE, 0, 512, -50, 50);
        this.asset = choice;
        this.color = 'grey';

        this.r = red(this.color);
        this.g = red(this.color);
        this.b = red(this.color);

        this.body = new Plane({
            asset: this.asset,
            x: this.x,
            y: 0.1,
            z: this.z,
            rotationX: -90,
            rotationY: getPreviewRotation(),
            width: brick[choice].width,
            height: brick[choice].height,
        });
        world.add(this.body);
    }

    updateControlPanel() {
        // update the buffer with our current position
        buffer.fill(this.r, this.g, this.b);
        buffer.rectMode(CENTER);

        // convert back out to buffer coords
        let bufferX = map(this.x, -50, 50, 0, 512);
        let bufferY = map(this.z, -50, 50, 0, 512);
        buffer.rect(bufferX, bufferY, CELLSIZE, CELLSIZE);
    }

    removeFromWorld() {
        // remove this robot's body from the world
        world.remove(this.body);
    }
}

// our Robot class that will randomly wander
class Robot {
    constructor() {
        // convert from buffer coords (512x512) to world coords (100x100)
        this.x = -50;
        this.z = -15;
        this.noiseLocationX = random(1000);
        this.noiseLocationZ = random(1000);

        // pick a color for this robot
        this.r = random(255);
        this.g = random(255);
        this.b = random(255);

        this.body = new Container3D({
            x: this.x,
            y: 0.5,
            z: this.z,
        });
        const head = new Dodecahedron({
            x: 0,
            y: 1,
            z: -5,
            radius: 0.5,
            red: this.r,
            green: this.g,
            blue: this.b,
        });
        this.body.add(head);
        const trunk = new Cylinder({
            x: 0,
            y: 0,
            z: -5,
            red: random(255),
            green: random(255),
            blue: random(255),
            radius: 0.5,
            clickFunction: function (entity) {
                console.log('robot clicked');
                this.speed = 0.4;
                entity.setBlue(0);
                entity.setGreen(0);
                entity.setRed(255);
            },
        });
        this.body.add(trunk);
        world.add(this.body);
    }

    updateControlPanel() {
        // update the buffer with our current position
        buffer.fill(this.r, this.g, this.b);
        buffer.rectMode(CENTER);

        // convert back out to buffer coords
        let bufferX = map(this.x, -50, 50, 0, 512);
        let bufferY = map(this.z, -50, 50, 0, 512);
        buffer.rect(bufferX, bufferY, 5, 5);
    }

    move() {
        // go towards our destination
        this.x += this.speed || map(noise(this.noiseLocationX), 0, 1, 0, 0.2);
        this.z = constrain(map(noise(this.noiseLocationZ), 0, 1, -0.1, 0.1) + this.z, -18, -12);
        // update our position
        this.body.setPosition(this.x, 0.5, this.z);

        this.noiseLocationZ += 0.01;
        this.noiseLocationX += 0.01;
        // have we arrived?  if so, remove
        if (this.x > 50) {
            music.play();
            this.removeFromWorld();
        }
    }

    removeFromWorld() {
        // remove this robot's body from the world
        world.remove(this.body);
    }
}

class Building {
    constructor(_x, _z, asset, scaleX, scaleY, scaleZ, color = 'blue', rotationY = 0) {
        // convert from buffer coords (512x512) to world coords (100x100)
        this.x = map(_x, 0, 512, -50, 50);
        this.z = map(_z, 0, 512, -50, 50);
        this.asset = asset;
        this.color = color;
        this.body = new GLTF({
            asset: asset,
            x: this.x,
            y: 0.1,
            z: this.z,
            scaleX: scaleX,
            scaleY: scaleY,
            scaleZ: scaleZ,
            rotationY: rotationY,
        });
        world.add(this.body);

        // a box for detecting clicks
        this.wrapper = new Box({
            x: this.x,
            y: 0,
            z: this.z,
            visible: false,
            clickFunction: function (entity) {
                console.log('clicked');
                world.slideToObject(entity, 2000);
            },
            width: metaData[asset].width,
            height: metaData[asset].height,
            depth: metaData[asset].depth,
        });
        world.add(this.wrapper);
    }

    displayControlPanel() {
        // display on the buffer with our current position
        buffer.fill(this.color);
        buffer.rectMode(CENTER);

        const dimensions = this.getDimensions();

        // get choice
        // this.choice, this.w, this.h
        let bufferX = map(this.x, -50, 50, 0, 512);
        let bufferY = map(this.z, -50, 50, 0, 512);
        // world is 100 * 100 and buffer is 512 * 512
        const w = map(dimensions.width, 0, 100, 0, 512);
        const h = map(dimensions.depth, 0, 100, 0, 512);
        buffer.rect(bufferX, bufferY, w, h);
    }

    getDimensions() {
        return getDimensions(this.body.tag.object3D);
    }

    removeFromWorld() {
        // remove this robot's body from the world
        world.remove(this.body);
        world.remove(this.wrapper);
    }
}

function viewWorld() {
    world.setUserPosition(0, 1, 40);
    const { x, y, z } = world.getUserRotation();
    // world.rotateCameraX((x * -180) / PI);
    // world.rotateCameraY((y * -180) / PI);
    // world.rotateCameraZ((z * -180) / PI);
}

function editWorld() {
    world.setUserPosition(0, 25, 1);
    const { x, y, z } = world.getUserRotation();
    // world.rotateCameraX((x * -180) / PI);
    // world.rotateCameraY((y * -180) / PI);
    // world.rotateCameraZ((z * -180) / PI);
}

function switchCamera() {
    document.querySelector('#VRScene').classList.toggle('hidden');
    const btns = document.querySelector('#panel').children;
    myForEach(btns, (b) => b.classList.toggle('hidden'));
    if (document.querySelector('iframe')) {
        document.querySelector('iframe').remove();
    } else {
        const camera = document.body.appendChild(document.createElement('iframe'));
        camera.src = 'camera.html';
    }
}

// helpers
function getDimensions(object3d) {
    // https://stackoverflow.com/questions/51380941/aframe-size-of-model
    const box = new THREE.Box3().setFromObject(object3d);
    const x = box.max.x - box.min.x;
    // console.log(box.max.x, box.min.x);
    const y = box.max.y - box.min.y;
    const z = box.max.z - box.min.z;
    return { width: x, height: y, depth: z };
}

function myForEach(collection, cb) {
    Array.prototype.forEach.call(collection, cb);
}

document.addEventListener('mousemove',function(){
    if (bgm && !bgm.isPlaying()){
        bgm.play();
    }
});
