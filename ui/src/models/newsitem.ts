export interface NewsItem {
    id: string,
	catalogref: string,
	companycode: string,
	companyname: string,
	datetime: Date,
	title: string,
	content: string
	sentiment: number
}