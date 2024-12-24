import { createTheme } from '@mui/material'
import { STYLE_VARIABLE } from '@renderer/constants/style-variable'

const themeConfig = createTheme({
  palette: {
    primary: {
      light: STYLE_VARIABLE.COLORS.PRIMARY.LIGHT,
      main: STYLE_VARIABLE.COLORS.PRIMARY.MAIN,
      dark: STYLE_VARIABLE.COLORS.PRIMARY.DARK,
      contrastText: '#fff'
    }
  },

  components: {
    MuiTabs: {
      styleOverrides: {
        root: {
          width: '100%',
          display: 'flex',
          borderRadius: 10
        }
      }
    },
    MuiTab: {
      styleOverrides: {
        root: {
          flex: 1
        }
      }
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: 'none',
          border: `'1px solid ${STYLE_VARIABLE.COLORS.SYSTEM.BORDER}`
        }
      }
    },
    MuiFormHelperText: {
      styleOverrides: {
        root: {
          padding: 0,
          margin: 0,
          paddingTop: 6
        }
      }
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 4,
          boxShadow: 'none',
          ':hover': {
            boxShadow: 'none'
          }
        }
      }
    },
    MuiButtonGroup: {
      styleOverrides: {
        root: {
          borderRadius: 4,
          boxShadow: 'none',
          ':hover': {
            boxShadow: 'none'
          }
        }
      }
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          fontSize: '16px',
          color: 'black',
          backgroundColor: 'white',
          border: 'solid',
          borderWidth: '1px',
          textAlign: 'center',
          borderColor: STYLE_VARIABLE.COLORS.SYSTEM.BORDER,
          boxShadow: 'revert',
          borderRadius: '4px',
          paddingTop: '8px',
          paddingBottom: '8px'
        }
      }
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 4
        }
      }
    },
    MuiList: {
      styleOverrides: {
        root: {
          padding: 0
        },
        padding: 0
      }
    },
    MuiMenuItem: {
      styleOverrides: {
        root: {
          borderBottomWidth: 1,
          borderBottomStyle: 'solid',
          paddingTop: 14,
          paddingBottom: 14,
          borderBottomColor: STYLE_VARIABLE.COLORS.SYSTEM.BORDER
        }
      }
    },
    MuiMenu: {
      styleOverrides: {
        root: { padding: 0 },
        paper: {
          margin: 0,
          borderRadius: 4,
          padding: 0,
          borderColor: STYLE_VARIABLE.COLORS.SYSTEM.BORDER,
          boxShadow: '0px 2px 10px rgba(0, 0, 0, 0.05)',
          borderWidth: 1
        },
        list: {
          margin: 0,
          paddingTop: 0,
          paddingBottom: 0
        }
      },
      defaultProps: {
        transformOrigin: {
          vertical: 'top',
          horizontal: 'right'
        },
        anchorOrigin: {
          vertical: 'bottom',
          horizontal: 'right'
        }
      }
    }
  }
})

export default themeConfig
