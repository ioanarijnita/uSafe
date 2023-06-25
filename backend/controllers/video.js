const { PythonShell } = require('python-shell');

exports.video = async (req, res) => {
  const file = req.files.file;

  if (!file) return res.sendStatus(400);
  const filePath = __dirname + '/upload/' + file.name;
  file.mv(__dirname + '/upload/' + file.name);

  let options = {
    mode: 'text',
    pythonOptions: ['-u'], // get print results in real-time
    scriptPath: './controllers/',
    args: [filePath] // argument which can be accessed in the script using sys.argv[1]
  };

  PythonShell.run('python.py', options).then((result) => {
    console.log("RESULT HERE IS ", result[result.length - 1].split(","));
    const responseParsed = JSON.parse(JSON.stringify(result[result.length - 1])).split(",")
    res.status(200).json({
      message: [...new Set(responseParsed)]
    });
  }).catch(e => console.log("ERR", e))
};
