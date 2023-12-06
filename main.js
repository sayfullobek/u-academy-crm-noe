const date = new Date(2023, 0, 1, 1, 1, 1, 1)
// console.log(date)
// console.log(date.getMonth() + 1)
// console.log(date.getDate() + 1)
// console.log(date.getFullYear())
// console.log(date.getUTCFullYear())
// console.log(date.getDay() + 1)
console.log(date)
for (var i = 0; i < 2; i++) {
    console.log("a")
}
function oyningKundanIboratliginiTop(oy, yil) {
    // JavaScript'da oyning indeksi 0 dan boshlanadi (0 - yanvar, 1 - fevral, ..., 11 - dekabr)
    const oyningBoshlanishi = new Date(yil, oy, 1);

    // Oyning birinchi kuni
    const birinchiKun = oyningBoshlanishi.getDate();

    // Oyning oxirgi kuni
    const oxirgiKun = new Date(yil, oy + 1, 0).getDate();

    // Necha kunlik ekanligini hisoblash
    const kunlarSoni = oxirgiKun - birinchiKun + 1;

    return kunlarSoni;
}

const oy = 0; // 0 - yanvar, 1 - fevral, ..., 11 - dekabr
const yil = 2023; // Yil
const kunlarSoni = oyningKundanIboratliginiTop(oy, yil);

console.log(`Mart oyida ${kunlarSoni} kun bor.`);