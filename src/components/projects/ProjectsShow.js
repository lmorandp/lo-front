import React from 'react';
import { SimpleShowLayout, Show, useQuery } from 'react-admin';
import { makeStyles } from '@material-ui/core/styles';
import { Grid, Typography, TableContainer, Table, TableCell, TableHead, TableRow, TableBody, Paper } from '@material-ui/core';
import { getCurrentUserId, getUsername, getToken } from '../authProvider';
import { currencyFormat } from "../../util";
import { UserFullName } from "../users/UserData";

const useStyles = makeStyles((theme) => ({
    root: {
        width: '90%',
        display: 'flex',
        marginLeft: 'auto',
        marginRight: 'auto'
    },
    gridItem: {
        width: '15%'
    },
    nestedGridItem: {
        width: '95%'
    },
    addButton: {
        width: '5%'
    },
    selectItem: {
        width: '90%'
    },
    cellbg: {
        backgroundColor: '#eee'
    }
}));


const ProjectShowInfo = ({ record }) => {
    const classes = useStyles();
    // const record = props.record;

    let totalFinancingAmount = 0;
    let totalMonthlyPAndI = 0;
    record.projectFinancingSources.forEach( source => {
        totalFinancingAmount += parseFloat(source['amount']);
        totalMonthlyPAndI += parseFloat(source['principalAndInterestPayment']);
    });

    return(
        <>
            <button
                onClick={event => exportPdfProjectReport(record, event)}
                className="btn btn-info btn-yellow pull-left"
            >
                Export PDF
            </button>
            {console.log(record)}
            <h1>Credit Memo Summary</h1>

            {/*<b>Date: {new Date().toDateString() }</b>*/}
            <b>Credit Memo Summary: {record.operatingCompany.name}</b>

            <p>Prepared by: {UserFullName(getCurrentUserId())}</p>

            <p><b>Project collateral property:</b> {record.streetAddress} {record.city}, {record.state} {record.postalCode} {record.country}</p>

            <p>
                <b>Project Costs</b>
                <ul>
                    <li>Total project costs are ${parseFloat(record.purchaseLandAndBuilding) + parseFloat(record.tenantImprovement) + parseFloat(record.eligibleFees)}; Purchased Land and Building ${record.purchaseLandAndBuilding}.</li>
                    <li>{record.generalDescription}</li>
                </ul>
            </p>

            <b>Financing</b>

            <TableContainer component={Paper}>
                <Table aria-label="simple table">
                    <TableHead className={classes.cellbg}>
                        <TableRow>
                            <TableCell>Source</TableCell>
                            <TableCell align="right">Amount</TableCell>
                            <TableCell align="right">Term</TableCell>
                            <TableCell align="right">%</TableCell>
                            <TableCell align="right">P&amp;I</TableCell>
                            <TableCell align="right">Amort</TableCell>
                            <TableCell align="right">Rate</TableCell>
                            <TableCell align="right">Lien</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {record.projectFinancingSources.map((row) => (
                            <TableRow key={row.financingSource.name}>
                                <TableCell component="th" scope="row">
                                    {row.financingSource.name}
                                </TableCell>
                                <TableCell align="right">{currencyFormat(row.amount)}</TableCell>
                                <TableCell align="right">{row.term}</TableCell>
                                <TableCell align="right">{row.percentage}%</TableCell>
                                <TableCell align="right">{currencyFormat(row.principalAndInterestPayment)}</TableCell>
                                <TableCell align="right">{row.amortization}</TableCell>
                                <TableCell align="right">{row.rate}%</TableCell>
                                <TableCell align="right">{row.lienPosition.position}</TableCell>
                            </TableRow>
                        ))}
                        <tr>
                            <TableCell className={classes.cellbg}><b>Total Financing:</b></TableCell>
                            <TableCell align="right"><b>{currencyFormat(totalFinancingAmount)}</b></TableCell>
                            <TableCell align="right" className={classes.cellbg} colSpan={2}><b>Total Monthly P&I Payment</b></TableCell>
                            <TableCell align="right"><b>{currencyFormat(totalMonthlyPAndI)}</b></TableCell>
                            <TableCell align="right" className={classes.cellbg} colSpan={2}><b>Total Annualized Payments</b></TableCell>
                            <TableCell align="right"><b>{currencyFormat(totalMonthlyPAndI * 12)}</b></TableCell>
                        </tr>
                        <tr>
                            <TableCell><b>Prepayment Penalty</b></TableCell>
                            <TableCell colSpan={7}>{record.paymentPenalty ? 'Yes' : 'no'}</TableCell>
                        </tr>
                        <tr>
                            <TableCell className={classes.cellbg}><b>Interim Lender</b></TableCell>
                            <TableCell colSpan={7}>{record.interimLender ? record.interimLender.name : 'n/a'}</TableCell>
                        </tr>
                        <tr>
                            <TableCell className={classes.cellbg} colSpan={8}>The CDC Interest Rate in the Financing Chart represents the coupon rate on the note. The SBA monthly P&I payment is calculated based on the "all-in" rate (coupon plus other fees) for the first 5 year period.</TableCell>
                        </tr>
                    </TableBody>
                </Table>
            </TableContainer>

            <br/>

            {record.borrower.map((b) => {
                if ('company' in b) {
                    let contactItems = [];
                    b.borrowerCompanyOwnership.forEach((bco) => {
                        contactItems.push(<li>{bco.ownershipPercent}% owned by {bco.contact.name}</li>);
                    });

                    return(
                        <>
                            <BorrowerLabel label={b.company.name}/>
                            <ul>
                                {contactItems}
                            </ul>
                            <br/>

                        </>
                    )
                } else {
                    return(
                        <>
                            <BorrowerLabel label={b.contact.name}/>
                            <br/>
                            <br/>
                        </>
                    )
                }
            })}

            <br/>

            {/*<p><b>Historical Cash Flows</b></p>*/}
            {/*<ul>*/}
                {/*<li>As of {record.periodEndingDate}, the OC has {record.cashOnHand ? '$'+record.cashOnHand : 'n/a'} and {record.workingCapital ? '$'+record.workingCapital : 'n/a'}. Liquidity is {record.liquidityStrength ? record.liquidityStrength : 'n/a'} as shown by the current ratio of {record.liquidityRatio ? record.liquidityRatio: 'n/a'}</li>*/}
            {/*</ul>*/}

            {record.guarantors.length > 0 &&
                <>
                    <p><b>Guarantors</b></p>
                </>
            }

            {record.guarantors.map((g) => {
                console.log(g);
                return (
                    <>
                        <p>{g.contact.name} -- FICO Score {g.ficoScore}</p>
                    </>
                )
            })}

        </>
    );
};

const BorrowerLabel = props => {
    return (<b>Borrower/EPC: {props.label}</b>)
};

export const ProjectsShow = props => (
    <Show {...props}>
        <SimpleShowLayout>
            <ProjectShowInfo />
        </SimpleShowLayout>
    </Show>
);

export function exportPdfProjectReport(item) {
    const entrypoint = process.env.REACT_APP_API_ENTRYPOINT;
    let headers = new Headers();

    headers.set('Accept', 'application/pdf');
    headers.set('Content-Type', 'application/pdf');
    headers.set('Authorization', 'Bearer ' + getToken());

    return (
        fetch(entrypoint.replace('/api', '') + item['@id'] + '/export/pdf', { method: 'POST', headers })
        // https://medium.com/yellowcode/download-api-files-with-react-fetch-393e4dae0d9e
        // 1. Convert the data into 'blob'
            .then(response => response.blob())
            .then(blob => {
                // 2. Create blob link to download
                const url = window.URL.createObjectURL(new Blob([blob]));
                const link = document.createElement('a');
                link.href = url;
                link.setAttribute(
                    'download',
                    `project-report-${item['@id'].replace('/api/projects/', '')}.pdf`
                );
                // 3. Append to html page
                document.body.appendChild(link);
                // 4. Force download
                link.click();
                // 5. Clean up and remove the link
                link.parentNode.removeChild(link);
            })
            .catch(e => {
            })
    );
}

