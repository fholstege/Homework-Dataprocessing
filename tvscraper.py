#!/usr/bin/env python
# Name: Floris Holstege
# Student number: 12002151
'''
This script scrapes IMDB and outputs a CSV file with highest rated tv series.
'''
import csv

from pattern.web import URL, DOM

TARGET_URL = "http://www.imdb.com/search/title?num_votes=5000,&sort=user_rating,desc&start=1&title_type=tv_series"
BACKUP_HTML = 'tvseries.html'
OUTPUT_CSV = 'tvseries.csv'

def extract_tvseries(dom):
    '''
    Extract a list of highest rated TV series from DOM (of IMDB page).
    '''

    #create list for storage of shows
    tv_series = []

    # iterate through descriptions of TV series
    for descr in dom('div.lister-item-content'):

        # create list for each show
        tv_show = []

        # retrieve headers
        for header in descr.by_tag("h3"):
            tv_show = [title.content.encode("utf-8") for title in header.by_tag("a")]
            
        # retrieve rating
        for rating in descr.by_tag('div.inline-block ratings-imdb-rating'):
            tv_show.append(rating.attrs.get("data-value").encode("utf-8"))

        # retrieve actors and create string of actor names
        actors = ''
        for actors_show in descr.by_tag('p')[2].by_tag('a'):
            actors += actors_show.content.encode("utf-8") + " - "

        tv_show.append(actors)

        # retrieve runtime and genre 
        for span in descr.by_tag('p')[0].by_tag("span"):
            
            if span.attrs.get("class") == "runtime":
                tv_show.append(span.content[0:3].encode("utf-8"))

            if span.attrs.get("class") == "genre":
                tv_show.append(span.content.encode("utf-8").replace("\n", ""))

        # store list of movie with all other movies
        tv_series.append(tv_show)
    
    return tv_series

def save_csv(f, tv_series):
    '''
    Output a CSV file containing highest rated TV-series.
    '''

    # create object to write, and write first row 
    writer = csv.writer(f)
    writer.writerow(['Title','Rating','Actors','Runtime', 'Genre'])
    
    # write each list as a row to the CSV file
    for tv_show in tv_series:
        writer.writerow(tv_show)

if __name__ == '__main__':
    # Download the HTML file
    url = URL(TARGET_URL)
    html = url.download()

    # Save a copy to disk in the current directory, this serves as an backup
    # of the original HTML, will be used in grading.
    with open(BACKUP_HTML, 'wb') as f:
        f.write(html)

    # Parse the HTML file into a DOM representation
    dom = DOM(html)

    # extract list of lists 
    tv_series = extract_tvseries(dom.body)

    # Write the CSV file to disk (including a header)
    with open(OUTPUT_CSV, 'wb') as output_file:
        save_csv(output_file, tv_series)
