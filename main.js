const {createApp} = Vue 
createApp({
    data(){
        return {
            memberList: [],
            parties: [],
            statesList: [],
            filteredMembers: [],
            selectedState: "ALL",
            listOfDem: [],
            listOfRep: [],
            listOfInd: [],
            numberOfDemocrats: 0,
            numberOfRepublicans: 0,
            numberOfIndependents: 0,
            totalNumberMembers: 0,
            averageVotesDemocrats: 0,
            averageVotesRepublicans: 0,
            averageVotesIndependents: 0,
            averageTotal: 0,
            mostEngaged: [],
            leastEngaged: [],
            leastLoyal: [],
            mostLoyal: []
        } 
    },
    created(){
        let chamber
        if (document.title.includes('Senate')) {
            chamber = 'senate'
        } else {
            chamber = 'house'
        }
        const url = `https://api.propublica.org/congress/v1/117/${chamber}/members.json`
        const apiKey = 'PmUp9ScCQW4LBapD9MvyJYUetvpQwBO9PLKvB7lL'
        const headers = {
            headers: {
                'X-API-Key': apiKey
            }
        }
        fetch(url, headers)
        .then(resp => resp.json())
        .then(data => {
            this.memberList = data.results[0].members
            this.filteredMembers = data.results[0].members
            this.statesList = Array.from(new Set(this.memberList.map((member) => member.state)))
            this.listOfDem = this.getLengthPartyMembers(this.memberList, 'D')
            this.listOfRep = this.getLengthPartyMembers(this.memberList, 'R')
            this.listOfInd = this.getLengthPartyMembers(this.memberList, 'ID')
            this.numberOfDemocrats = this.listOfDem.length
            this.numberOfRepublicans = this.listOfRep.length
            this.numberOfIndependents = this.listOfInd.length
            this.totalNumberMembers = this.memberList.length
            this.averageVotesDemocrats = this.getAverageOfVotes(this.listOfDem, 'votes_with_party_pct')
            this.averageVotesRepublicans = this.getAverageOfVotes(this.listOfRep, 'votes_with_party_pct')
            this.averageVotesIndependents = this.getAverageOfVotes(this.listOfInd, 'votes_with_party_pct')
            this.averageTotal = this.getAverageTotal([this.listOfDem, this.listOfRep, this.listOfInd ])
            this.mostEngaged = this.getTenPercent(this.memberList, 'missed_votes_pct', true)
            this.leastEngaged = this.getTenPercent(this.memberList, 'missed_votes_pct', false)
            this.leastLoyal = this.getTenPercent(this.memberList, 'votes_against_party_pct', false)
            this.mostLoyal = this.getTenPercent(this.memberList, 'votes_against_party_pct', true)
        })
        .catch(error => console.log(error))
    },
    methods: {
        getLengthPartyMembers : function (array, party){
            return array.filter(member => member.party === party)
        },
        getAverageOfVotes: function (array, property){
            if(array.length === 0){
                return 0
            }
            const votesPct = array
                .map(member => {
                    if (member[property]) {
                        return member[property]
                    } else {
                        return null
                    }
                })
                .filter(element => element !== null)
                .reduce((acc, cur) => acc + cur, 0)
            const averageVotes = votesPct / array.length
            const averageVotesDec = averageVotes.toFixed(2);
            const stringToNumber = Number.parseFloat(averageVotesDec)
            return stringToNumber
        },
        getAverageTotal: function (partiesList){
            let divider = 0
            let dividend = 0
            partiesList.forEach(party => {
                if (party.length > 0) {
                    divider++
                    dividend = dividend + this.getAverageOfVotes(party, 'votes_with_party_pct')
                }
            })
            const averageTotal = Number.parseFloat((dividend / divider).toFixed(2))
            return averageTotal
        },
        getTenPercent: function (members, property, boolean){
            const auxMembers = members.filter(member => member[property])
            .sort((a, b) => {
            if (boolean) {
                return a[property] - b[property]
            } else {
                return b[property] - a[property]
            }
           })
           const tenPercentMembers = Math.ceil(auxMembers.length * .1)
           const tenPosition = auxMembers[tenPercentMembers -1][property]
           if (boolean) {
                return auxMembers.filter(member => member[property] <= tenPosition)
            } else {
                return auxMembers.filter(member => member[property] >= tenPosition)
            }
        }
    },
    computed: {
        filter : function(){
            this.filteredMembers = this.memberList.filter( member => {
                if(this.parties.length > 0 ){
                    if(this.selectedState === "ALL") {
                        return this.memberList
                    && this.parties.includes(member.party)
                    }
                    return member.state.includes(this.selectedState)
                    && this.parties.includes(member.party)
                }
                if(this.selectedState === "ALL") {
                    return this.memberList
                }
                return member.state.includes(this.selectedState)
            })
        }
    }
}).mount('#app')