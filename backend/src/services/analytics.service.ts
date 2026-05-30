import mongoose, { PipelineStage } from "mongoose";
import { DateRangeEnum, DateRangePreset } from "../enums/date-range.enum";
import TransactionModel, { TransactionTypeEnum } from "../models/transaction.model";
import { getDateRange } from "../utils/date";
import { differenceInDays, sub, subDays, subYears } from "date-fns";
import { convertToDollarUnit } from "../utils/format-currency";

export const summaryAnalyticsService = async(userId:string,dateRangePreset?:DateRangePreset,customFrom?:Date,customTo?:Date)=>{

    const range = getDateRange(dateRangePreset,customFrom,customTo);

    const {from,to,value:rangeValue} = range;

    const currentPeriodPipeline:PipelineStage[] = [
        {
            $match:{
                userId:new mongoose.Types.ObjectId(userId),
                ...(from && to && {
                    date:{
                        $gte:from,
                        $lte:to, //Give me transactions where:userId = X AND date is between from and to”
                    },

                }),
            },
            
        },
        {
            $group:{
                _id:null,
                totalIncome:{
                    $sum:{
                        $cond:[
                            {$eq:["$type",TransactionTypeEnum.INCOME]},
                            {$abs:"$amount"},
                            0
                        ]
                    }
                },
                totalExpenses:{
                    $sum:{
                        $cond:[
                            {$eq:["$type",TransactionTypeEnum.EXPENSE]},
                            {$abs:"$amount"},
                            0
                        ]
                    }
                },
                transactionCount:{$sum:1}
            
            }
        },
        {
            $project:{
                _id:0,
                totalIncome:1,
                totalExpenses:1,
                transactionCount:1,
                availableBalance:{$subtract:["$totalIncome","$totalExpenses"]},
                    // if(totalIncome<=0) return 0;
                    // const savingRate = (totalIncome - totalExpenses)/totalIncome * 100;
                savingData:{
                    $let:{
                        vars:{
                            income:{ $ifNull:["$totalIncome",0]},
                            expenses:{ $ifNull:["$totalExpenses",0]},

                        },
                        in:{
                            savingsPercentage:{
                                $cond:[
                                    {$lte:["$$income",0]},
                                    0,
                                    {
                                        $multiply:[
                                            {
                                                $divide:[
                                                    {
                                                        $subtract:["$$income","$$expenses"],
                                                        
                                                    },
                                                    "$$income",
                                                ]
                                            },
                                            100,
                                        ]
                                    }
                                ]
                            },
                            //expenseRatio = (expenses / income) * 100
                            expenseRatio:{
                                $cond:[
                                    {$lte:["$$income",0]},
                                    0,
                                    {
                                        $multiply:[{
                                            $divide:["$$expenses","$$income"],

                                        },100]
                                    }
                                ]
                            },
                        }

                    },
                }

            }
        }
    ]

    const [current] = await TransactionModel.aggregate(currentPeriodPipeline);

    const {
        totalIncome = 0,
        totalExpenses = 0,
        availableBalance = 0,
        savingData = {
            expenseRatio:0,
            savingsPercentage:0,
        },
        transactionCount = 0,
    } = current || {};

    let percentageChange:any = {
        income:0,
        expenses:0,
        balance:0,
        prevPeriodFrom:null,
        prevPeriodTo:null,
        previousValues:{
            incomeAmount:0,
            expensesAmount:0,
            balanceAmount:0,
        },
    };

    if(from && to && rangeValue !== DateRangeEnum.ALL_TIME){


        //last 30 days
        const period = differenceInDays(to,from) + 1;//since we used yeaterday 
     


        const isYearly = [DateRangeEnum.LAST_YEAR,DateRangeEnum.THIS_YEAR].includes(rangeValue);

        const prevPeriodFrom = isYearly ? subYears(from,1) : subDays(from,period);
        const prevPeriodTo = isYearly ? subYears(to,1) : subDays(to,period);
        console.log(prevPeriodFrom,prevPeriodTo,"Prev Date");

        const prevPeriodPipeline = [
                    {
                        $match:{
                            userId:new mongoose.Types.ObjectId(userId),
                
                            date:{
                                $gte:prevPeriodFrom,
                                $lte:prevPeriodTo,
                            },
                        }

                        
                    },
                    {
                         $group:{
                            _id:null,
                            totalIncome:{
                                $sum:{
                                    $cond:[
                                        {$eq:["$type",TransactionTypeEnum.INCOME]},
                                        {$abs:"$amount"},
                                        0
                                    ]
                                }
                            },
                            totalExpenses:{
                                $sum:{
                                    $cond:[
                                        {$eq:["$type",TransactionTypeEnum.EXPENSE]},
                                        {$abs:"$amount"},
                                        0
                                    ]
                                }
                            },
                  
                        
                        }
                    },
        ];
        
        const [previous] = await TransactionModel.aggregate(prevPeriodPipeline);
        console.log(previous,"Previous Data");

        if(previous){
            const prevIncome = previous.totalIncome || 0;
            const prevExpenses = previous.totalExpenses || 0;
            const prevBalance = prevIncome - prevExpenses;

            const currentIncome = totalIncome;
            const currentExpenses =  totalExpenses;
            const currentBalance = availableBalance;

            percentageChange = {
                income:calculatePercentageChange(prevIncome,currentIncome),
                expenses:calculatePercentageChange(prevExpenses,currentExpenses),
                balance:calculatePercentageChange(prevBalance,currentBalance),
                prevPeriodFrom:prevPeriodFrom,
                prevPeriodTo:prevPeriodTo,
                previousValues:{
                    incomeAmount:prevIncome,
                    expensesAmount:prevExpenses,
                    balanceAmount:prevBalance,
                },

            }

        }



    };
    return {
        availableBalance:convertToDollarUnit(availableBalance),
        totalIncome:convertToDollarUnit(totalIncome),
        totalExpenses:convertToDollarUnit(totalExpenses),
        savingRate:{
            expenseRatio:parseFloat(savingData.expenseRatio.toFixed(2)),
            percentage:parseFloat(savingData.savingsPercentage.toFixed(2)),
        },
        transactionCount,
        percentageChange:{
            ...percentageChange,
            previousValues:{
                incomeAmount:convertToDollarUnit(percentageChange.previousValues.incomeAmount),
                expensesAmount:convertToDollarUnit(percentageChange.previousValues.expensesAmount),
                balanceAmount:convertToDollarUnit(percentageChange.previousValues.balanceAmount),

            },
        },
        preset:{
            ...range,
            value:rangeValue || DateRangeEnum.ALL_TIME,
            label:range?.label || "All Time",
        }


    }





};



export const expensePieChartService = async(userId:string,dateRangePreset?:DateRangePreset,customFrom?:Date,customTo?:Date)=>{
    const range = getDateRange(dateRangePreset,customFrom,customTo);

    const {from,to,value:rangeValue} = range;

    const filter:any= 
        {
            
            userId:new mongoose.Types.ObjectId(userId),
            type:TransactionTypeEnum.EXPENSE,
            ...(from && to && {
                date:{
                        $gte:from,
                        $lte:to, //Give me transactions where:userId = X AND date is between from and to”
                    },

                }),
            
            
    };

    const pipeline: PipelineStage[] = [
        {
            $match:filter,
        },
        {
            $group:{
                _id:"$category",
                value:{$sum:{$abs:"$amount"}},
            },
        },
        {
            $sort:{value:-1},
        },
        {
            $facet:{
                topThree:[{$limit:3}],
                others:[
                    {$skip:3},
                    {$group:{
                        _id:"others",
                        value:{$sum:"$value"},
                    }}
                ]
            }
        },
        {
            $project:{
                categories:{
                    $concatArrays:["$topThree","$others"],

                },
            },
        },
        {            $unwind:"$categories"        },
        {$group:{
            _id:null,
            totalSpent:{$sum:"$categories.value"},
            breakdown:{$push:"$categories"},
            },
        },
        {
            $project:{
                _id:0,
                totalSpent:1,
                breakdown:{
                    $map:{
                        input:"$breakdown",
                        as:"cat",
                        in:{
                            name:"$$cat._id",
                            value:"$$cat.value",
                            percentage:{
                                $cond:[
                                    {$eq:["$totalSpent",0]},
                                    0,
                                    {
                                        $round:[{
                                            $multiply:[
                                                {$divide:["$$cat.value","$totalSpent"]},100,
                                            ]
                                        },0]
                                    }
                                ]
                            }
                        }
                    }
                },


            }
        }
    ];

    const result  = await TransactionModel.aggregate(pipeline);
    const data = result[0] || {
        totalSpent:0,breakdown:[],
    };

    const transformedData = {
        ...data,
        totalSpent:convertToDollarUnit(data.totalSpent),
        breakdown:(data.breakdown).map((item:any)=>({
            ...item,
            value:convertToDollarUnit(item.value),
        })),
    };

    return{
        ...transformedData,
         preset:{
            ...range,
            value:rangeValue || DateRangeEnum.ALL_TIME,
            label:range?.label || "All Time",
        }
    } 

};

export const chartAnalyticsService = async(userId:string,dateRangePreset?:DateRangePreset,customFrom?:Date,customTo?:Date)=>{
    const range = getDateRange(dateRangePreset,customFrom,customTo);
    const {from,to,value:rangeValue} = range;

    const filter:any= 
        {
            
            userId:new mongoose.Types.ObjectId(userId),
       
            ...(from && to && {
                date:{
                        $gte:from,
                        $lte:to, //Give me transactions where:userId = X AND date is between from and to”
                    },

                }),
            
            
    };

    const result = await TransactionModel.aggregate([
        {$match:filter },
        //group transaction by date
        {
            $group:{
                _id:{
                    $dateToString:{
                        format:"%Y-%m-%d",
                        date:"$date",
                        
                    },
                },
                income:{
                    $sum:{
                        $cond:[
                            {$eq:["$type",TransactionTypeEnum.INCOME]},
                            {$abs:"$amount"},
                            0
                        ]
                    }
                },
                expenses:{
                    $sum:{
                        $cond:[
                            {$eq:["$type",TransactionTypeEnum.EXPENSE]},
                            {$abs:"$amount"},
                            0
                        ]
                    }
                },
                incomeCount:{
                    $sum:{
                        $cond:[
                            {$eq:["$type",TransactionTypeEnum.INCOME]},
                            1,
                            0
                                                        
                        ]
                    }
                },
                expenseCount:{
                    $sum:{
                        $cond:[
                            {$eq:["$type",TransactionTypeEnum.EXPENSE]},
                            1,
                            0
                                                        
                        ]
                    }
                },
                

            }
        },
        {
            $sort:{
                _id:1 //here _id is the date so sort in ascending date order
            }
        },
        {
            $project:{
                _id:0,//remove this and replace with date
                date:"$_id",
                income:1,
                expenses:1,
                incomeCount:1,
                expenseCount:1,

            }
        },
        {
            $group:{
                _id:null,
                chartData:{$push:"$$ROOT"},
                totalIncomeCount:{$sum:"$incomeCount"},
                totalexpenseCount:{$sum:"$expenseCount"},



            }
        },
        {
            $project:{
                _id:0,
                chartData:1,
                totalIncomeCount:1,
                totalexpenseCount:1,
            }
        }

    ]);

    const resultData = result[0] || {}; 

    const transformData= (resultData?.chartData || []).map((item:any)=>({
        date:item.date,
        income:convertToDollarUnit(item.income),
        expenses:convertToDollarUnit(item.expenses),
    }));

    return {
        chartData:transformData,
        totalIncomeCount:resultData.totalIncomeCount,
        totalexpenseCount:resultData.totalexpenseCount,
        preset:{
            ...range,
            value:rangeValue || DateRangeEnum.ALL_TIME,
            label:range?.label || "All Time",
        }
    };

};

function calculatePercentageChange(prevIncome:number,currentIncome:number){
    if(prevIncome === 0 ) return currentIncome === 0 ? 0 : 100;
    const changes = ((currentIncome - prevIncome) / Math.abs(prevIncome)) * 100;
    const cappedChanges = Math.min(Math.max(changes,-500),500);
    return parseFloat(cappedChanges.toFixed(2));
}