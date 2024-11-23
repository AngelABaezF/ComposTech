var nombre ="Alex"
{
    let nombre = "Angel"
    //console.log(nombre)
    let apellido = "Flores"
    console.log("Mi nombre es", nombre, apellido)
}
const apellido = "Baez"
/*console.log(nombre)
console.log(apellido)*/
console.log(`Mi nombre es ${nombre} ${apellido}`)

function suma(x,y){
    return x + y
}

const suma2 = function(x,y){
    return x + y
}

const suma3 = (x,y) => {
    return x + y
}

const suma4 = (x,y) => x + y
/*console.log(suma(2,3))
console.log(suma2(2,3))
console.log(suma3(2,3))
console.log(suma4(2,3))*/
console.log(suma(2,3), suma2(2,3), suma3(2,3), suma4(2,3))

const estudiante = {
    name: "Juan",
    edad: 25,
    carrera: "Ing. Sistemas"
}

console.log(`La edad del estudiante es ${estudiante.edad}`)

const {name, edad} = estudiante
console.log(estudiante)

let arreglo = [1,2,3,4]
let arreglo2 = [5,6,7,8]

arreglo = [...arreglo, ...arreglo2]

console.log(arreglo)