// this is for use this data below for an environment variable.
console.log(
    JSON.stringify(
        JSON.parse(Deno.readTextFileSync("./_configs/firebase-admin.json"))
    )
)
