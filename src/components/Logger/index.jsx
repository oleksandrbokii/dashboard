import React, { Component } from 'react'
import socket from 'socket.io-client'

import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Avatar from '@material-ui/core/Avatar';
import AccountBox from '@material-ui/icons/AccountBoxRounded';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Typography from '@material-ui/core/Typography';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableRow from '@material-ui/core/TableRow';
const config = require('../../services/configuration')

const styles = theme => ({
  root: {
    width: '80%',
    marginTop: theme.spacing.unit * 3,
    overflowX: 'auto',
  },
  card: {
    display: 'flex',
    marginTop: theme.spacing.unit * 3,
  },
  details: {
    display: 'flex',
    flexDirection: 'column',
  },
  content: {
    flex: '1 0 auto',
    paddingLeft: '15px',
  },
  cover: {
    width: 151,
  },
  avatar: {
    margin: 10,
  },
  table: {
    marginTop: 20,
    minWidth: 700,
  },
  tableCell: {
    border: 0,
  },
  tableRow: {
    height: 20,
  },
});

class Logger extends Component {

  state = {
    allActivities: [],
    logStream: []
  }

  componentDidMount = async () => {
    await this.getAllActivities()
  }

  getAllActivities = async () => {
    const io = socket(config.serverHost)
    io.on('newLogData', data => {
      // first record, arrow function to bring previous state
      this.setState(prevState => ({
        // check if new data(account) is contained on old state
        // if contained, retrieve all data until ->
        logStream: prevState.logStream.find(item => item.account === data.account) ? prevState.logStream.map(item => {
          data.msg = data.msg.substring(0, 140)
          // until reach the correct index to update it
          if (item.account === data.account && item.msg.length <= 5) {
            // spread and add the new msg to the existent the array
            return { ...item, msg: [...item.msg, data.msg] }
          } else if (item.account === data.account && item.msg.length > 5) {
            item.msg.shift()
            return { ...item, msg: [...item.msg, data.msg] }
          } else {
            return item
          }
          // append a new data(account) to the existent state
        }) : [...prevState.logStream, { account: data.account, msg: [data.msg] }]
      }))
    })
  }


  render() {
    const { classes } = this.props;
    let logCards = this.state.logStream.map((item, index) => {
      return (
        <LogItem key={item.account + index}
          accountName={item.account}
          msgs={item.msg}
          cssCard={classes.card}
          cssDetails={classes.details}
          cssContent={classes.content}
          cssAvatar={classes.avatar}
          cssTable={classes.table}
          cssRow={classes.tableRow}
          cssCell={classes.tableCell}
        />)
    })
    return (
      <div className="wrapper" >
        {logCards}
      </div>
    )
  }
}

const LogItem = props => {
  const rows = props.msgs.map((msg, index) => (
    <TableRow key={index} className={props.cssRow}>
      <TableCell className={props.cssCell}>{msg}</TableCell>
    </TableRow>
  ));
  return (
    <Card className={props.cssCard}>
      <Avatar className={props.cssAvatar}>
        <AccountBox />
      </Avatar>
      <div className={props.cssDetails}>
        <CardContent className={props.cssContent}>
          <Typography variant="subtitle1" color="textSecondary">
            @{props.accountName}
              </Typography>
          <Table className={props.cssTable}>
            <TableBody>
              {rows}
            </TableBody>
          </Table>
        </CardContent>
      </div>
    </Card>
  )
}

Logger.propTypes = {
  classes: PropTypes.object.isRequired,
  theme: PropTypes.object.isRequired,
};

export default withStyles(styles, { withTheme: true })(Logger);