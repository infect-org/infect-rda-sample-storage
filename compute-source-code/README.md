# INFECT Map & Reduce Calls

## GET https://api.infect.info/rda/v2/rda.data
### Query Parameter `filter`

The query paramter `filter` accepts a JSON object, that can be used to filter the isolate data stored in the in memory database. All filters can be combined and will act as `AND` filters, meaning that a given sample has to satisfy all defined filter criterias in order to be processed by the reduction processor.


#### property `dataVersionIds`
Array containing ids for data versions; this will filter the dataset for the given data versions as definde by rda itself
```JSON
{
    "dataVersionIds": [1, 2]
}
```

#### property `animalIds`
Array containing ids for animals; this will filter the dataset for the given animals as defined by the master data
```JSON
{
    "animalIds": [1, 2]
}
```

#### property `countryIds`
Array containing ids for countries; this will filter the dataset for the given countries as defined by the master data
```JSON
{
    "countryIds": [1, 2]
}
```

#### property `patientSettingIds`
Array containing ids for patient settings; this will filter the dataset for the given patient settings as defined by the master data
```JSON
{
    "patientSettingIds": [1, 2]
}
```

#### property `patientSexIds`
Array containing ids for patient sex; this will filter the dataset for the given patient sex as defined by the master data
```JSON
{
    "patientSexIds": [1, 2]
}
```

#### property `regionIds`
Array containing ids for regions; this will filter the dataset for the given regions as defined by the master data
```JSON
{
    "regionIds": [1, 2]
}
```

#### property `sampleSourceIds`
Array containing ids for sample sources; this will filter the dataset for the given sample sources as defined by the master data
```JSON
{
    "sampleSourceIds": [1, 2]
}
```

#### property `compoundSubstanceIds`
Array containing ids for compound substances; this will filter the dataset for the given compound substances as defined by the master data
```JSON
{
    "compoundSubstanceIds": [1, 2]
}
```

#### property `microorganismIds`
Array containing ids for microorganisms; this will filter the dataset for the given microorganisms as defined by the master data
```JSON
{
    "microorganismIds": [1, 2]
}
```

#### property `dataVersionStatusIdentifier`
Array containing ids for data version status; this will filter the dataset for the given data version status as definde by rda itself
```JSON
{
    "dataVersionStatusIdentifier": ["active"]
}
```

#### property `ageGroupIntervals`
Array containing objects with a from to range in days. For the range 10-15 years, one woult chose the from value as 10 * 365 and the to value as 15 * 365
```JSON
{
    "ageGroupIntervals": [{
        "daysFrom": 3650,
        "daysTo": 5475
    }]
}
```




### Query Parameter `subRoutines`

The query paramter `subRoutines` accepts a JSON array containing names of subroutines to execute on the dataset. It must be used in conjunction of the `compoundSubstanceIds` and `microorganismIds` filters. The filters need to be present in order to execute the subroutines because an unfiltered data set may result in too much load.


#### Sub routine `MICPercentileSubRoutine`
This will compute the 90% percentile for the mic resistance values on the samples (MHK90)

Query parameter value
```JSON
[ "MICPercentileSubRoutine" ]
```
This will add the MICPercentile90 property to the value obejcts returned from RDA
```JSON
{
    "MICPercentile90": {
        "percentile": 90,
        "percentileValue": 45.6,
        "slots": {
            "rangeMin": 0,
            "rangeMax": 53.9,
            "slotSize": 2.156,
            "slotCount": 25,
            "slots": [{
                "fromValue": 0,
                "toValue": 2.156,
                "sampleCount": 0
            }, {
                "fromValue": 2.156,
                "toValue": 4.312,
                "sampleCount": 0
            }, {
                "fromValue": 4.312,
                "toValue": 6.468,
                "sampleCount": 0
            }]
        }
    }
}
```


#### Sub routine `DiscDiffusionPercentile`
This will compute the 90% percentile for the disc diffusion resistance values on the samples

Query parameter value
```JSON
[ "DiscDiffusionPercentile" ]
```
This will add the discDiffusionPercentile90 property to the value obejcts returned from RDA
```JSON
{
    "discDiffusionPercentile90": {
        "percentile": 90,
        "percentileValue": 45.6,
        "slots": {
            "rangeMin": 0,
            "rangeMax": 53.9,
            "slotSize": 2.156,
            "slotCount": 25,
            "slots": [{
                "fromValue": 0,
                "toValue": 2.156,
                "sampleCount": 0
            }, {
                "fromValue": 2.156,
                "toValue": 4.312,
                "sampleCount": 0
            }, {
                "fromValue": 4.312,
                "toValue": 6.468,
                "sampleCount": 0
            }]
        }
    }
}
```