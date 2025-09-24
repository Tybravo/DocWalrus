module.exports = function() {

    return {
        namespace: 'Major-Plugin',
        async loadContent() {
            console.log("Plugins built and created for document markdowns");
        }
    }
}