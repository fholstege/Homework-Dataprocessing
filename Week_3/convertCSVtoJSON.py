import csv
import json

class CSVtoJSON:  
	"""
	Converts a csv file to a JSON file 
	"""
	def __init__(self, csv_file):
		"""
		Stores csv file in JSON format
		"""	
		with open(csv_file, "rb") as data:
			reader = csv.reader(data)
			self.data_list = []

			# iterate through rows of csv file 
			for row in reader:
				dictionary = {"Nation": row[0], "Renewable": float(row[1])}
				self.data_list.append(dictionary)

	def write_JSON(self, outfile):
		"""
		Writes out csv file as JSON to respective JSON file
		"""
		with open(outfile, 'w') as outfile:
			json.dump(self.data_list, outfile)


test = CSVtoJSON("renewable_data.csv")
test.write_JSON("renewable_data.json")


