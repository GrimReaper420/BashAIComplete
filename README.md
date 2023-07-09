# Bash AI Roided

Bash AI Roided is a fork of Bash AI. It improves on the original. Bash AI is a command-line tool that uses the power of OpenAI's GPT-3 to provide intelligent suggestions and automation for your bash commands.

![Imgur](https://imgur.com/5kGTZwv.gif)

## Installation

You can install Bash AI via npm:

```bash
npm install -g @screamingpanic/bash-ai-roidedy
```

## Usage

Before using Bash AI, you'll need to set your OpenAI API key. You will be prompted to enter the key during the installation. If you choose to skip entering the key during the installation stage, You will also be prompted to enter it after you make a request.

To use Bash AI, simply invoke it in your terminal:

```bash
?? <your request here>
```

Bash AI will listen to your commands and provide suggestions and automation as needed.

## Configuration

A configuration file is created in ~/.bash-ai-roided. It contains information such as the OpenAI API key. Feel free to edit it. 

## Improvements

### ver 1.1.233
#### Features

* Adding ability to enable logging from the user configuration file (this can be used to see the full prompt sent to the API)

### ver 1.1.230
#### Fixes

* A whole slew of errors have been taken take of
* Much of under-the-hood work has been redone

### ver 1.1.1
#### Fixes

* Changed the storage of the API key from an environment variable to a configuration file (for security reasons)
* Updated logging and error handling
* Reduced length of pompt by removing file list (reduces cost of using)

### ver 1.1.0
#### New features

* Switch models from text-davinci-03 to gpt-3.5-turbo (reduces cost and increases performance)
* Increase max response token count from 16 to 124 (prevents early cutoff)
* Add linux distro information to environment (localizes output)

#### Fixes

* Remove promp intructions replication
* Fix typos and formatting