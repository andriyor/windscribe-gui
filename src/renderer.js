// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// No Node.js APIs are available in this process because
// `nodeIntegration` is turned off. Use `preload.js` to
// selectively enable features needed in the rendering
// process.

const {
  colors,
  CssBaseline,
  ThemeProvider,
  Container,
  MenuItem,
  InputLabel,
  makeStyles,
  Select,
  FormControl,
  createMuiTheme,
  Button,
  green
} = MaterialUI;

// Create a theme instance.
const theme = createMuiTheme({
  palette: {
    primary: {
      main: '#556cd6',
    },
    secondary: {
      main: '#19857b',
    },
    error: {
      main: colors.red.A400,
    },
    background: {
      default: '#fff',
    },
  },
});

const execa = require('execa');
const { ipcRenderer } = require('electron')

const useStyles = makeStyles((theme) => ({
  formControl: {
    margin: theme.spacing(1),
    minWidth: 120,
  },
  selectEmpty: {
    marginTop: theme.spacing(2),
  },
}));

function App() {
  const classes = useStyles();
  
  React.useEffect(() => {
    execa('windscribe', ['locations']).then(({stdout}) => {
      const allLocations = parseLocations(stdout);
      const freeLocations = getFreeLocations(allLocations);
      setLocations(freeLocations);
      
      execa('windscribe', ['status']).then(({stdout}) => {
        handleStatus(stdout);
      })
    })
  }, []);
  
  const [currentLocation, setCurrentLocation] = React.useState('');
  const [locations, setLocations] = React.useState([]);
  const [isEnabled, setIsEnabled] = React.useState(false);
  
  function parseLocations(locationsStdout) {
    const allLocations = locationsStdout.split('\n').slice(1);
    const locations = []
    for (const location of allLocations) {
      const array = location.replace(/\s\s+/g, '  ').split('  ');
      locations.push({
        location: array[0],
        shortName: array[1],
        cityName: array[2],
        label: array[3],
        pro: !!array[4],
      })
    }
    return locations;
  }
  
  function getFreeLocations(locations) {
    return locations.filter(location => !location.pro);
  }
  
  function connect(location) {
    execa('windscribe', ['connect', location]).then(({stdout}) => {
      handleStatus(stdout);
    })
  }
  
  function disconnect() {
    execa('windscribe', ['disconnect']).then(({stdout}) => {
      handleStatus(stdout);
    })
  }
  
  function handleClick() {
    if (isEnabled) {
      disconnect();
    } else {
      connect(currentLocation);
    }
  }
  
  function handleStatus(stdout) {
    if (stdout.toLowerCase().includes('disconnected')) {
      setIsEnabled(false);
      ipcRenderer.send('set-disable');
    } else if (stdout.toLowerCase().includes('connected')) {
      setIsEnabled(true);
      ipcRenderer.send('set-enable');
    }
  }
  
  const handleChange = (event) => {
    setCurrentLocation(event.target.value);
  };
  
  const color = isEnabled ? '#4caf50': 'white';
  return (
    <Container maxWidth="sm">
      <div style={{ marginTop: 24, display: 'flex' }}>
        <FormControl className={classes.formControl}>
          <InputLabel id="demo-simple-select-label">Location</InputLabel>
          <Select labelId="demo-simple-select-label"
                  id="demo-simple-select"
                  value={currentLocation}
                  onChange={handleChange}>
            {locations.map(location => <MenuItem value={location.label} key={location.label}>
              <span
                style={{ marginRight: 5 }}
                className={`flag-icon flag-icon-${location.shortName.split('-')[0]}`}
              ></span>
              {location.location}
            </MenuItem>)}
          </Select>
        </FormControl>
        <Button
          style={{ backgroundColor: color, marginLeft: 80}}
          variant="contained"
          onClick={() => handleClick()}
        >
          {isEnabled? 'Disconnect' : 'Connect'}
        </Button>
      </div>
    </Container>
);
}
  
  ReactDOM.render(
    <ThemeProvider theme={theme}>
      {/* CssBaseline kickstart an elegant, consistent, and simple baseline to build upon. */}
      <CssBaseline />
      <App />
    </ThemeProvider>,
  document.querySelector('#root'),
);
