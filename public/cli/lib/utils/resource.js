//
// Resource
// A default Resource Class definition.
//

const Resource = function(options) {
    this.command = "command";
    this.params = "--parameters here";
    this.descriptionShort = "you should describe this command";
    this.descriptionLong = `
A much longer description of this command.
`;
    this.help = () => {
        return `

appbuilder ${this.command} ${this.params}

${this.descriptionLong}

`;
    };

    for (var o in options) {
        this[o] = options[o];
    }
};

Resource.run = function(/* args, options */) {};

module.exports = Resource;
