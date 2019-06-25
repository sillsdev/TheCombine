import {Word} from "../../../../../types/word";
import React from "react";
import {withLocalize, LocalizeContextProps} from "react-localize-redux";
import {Paper, Card, CardContent} from "@material-ui/core";
import WordContent from "../../WordCard";
import {Sense} from "../../component";

export interface StackDisplayProps {
	sense: Sense;
	dragWord?: (word: Word) => void;
	dropWord?: () => void;
	moveWord?: (word: Word, index: number) => void;
	addDuplicate?: (word: Word, parent: number) => void;
	removeDuplicate?: (word: Word, parent: number) => void;
	closePopper?: () => void;
	draggedWord?: Word;
}

export interface StackDisplayState {}

class StackDisplay extends React.Component<
	StackDisplayProps & LocalizeContextProps,
	StackDisplayState
	> {
	dragDrop(event: React.DragEvent<HTMLElement>, index: number) {
		console.log(index);
		event.preventDefault();
		event.stopPropagation();
		if (this.props.draggedWord) {
			var word = this.props.draggedWord;
			// if we are getting our card from external to this list we want to add it and then move it to it's new position
			if (
				!this.props.sense.dups.includes(this.props.draggedWord) &&
				this.props.addDuplicate
			) {
				// Card is coming from somewhere external to this stack
				// add the card to the stack before reorganizing it
				this.props.addDuplicate(word, this.props.sense.id);
				// in this case we also want to remove the word from it's source list
				// we only want to do this when it is coming from elsewhere not when moving
				// cards within the list
				if (this.props.dropWord) this.props.dropWord();
			}
			// now we can move dragged word to the requested position
			if (this.props.moveWord) {
				this.props.moveWord(word, index);
			}
		}
		this.setState({});
	}

	drag(word: Word) {
		if (this.props.dragWord) {
			this.props.dragWord(word);
		}
	}

	removeCard(word: Word) {
		if (this.props.draggedWord && this.props.dropWord) {
			this.props.dropWord();
		} else {
			if (this.props.removeDuplicate) {
				this.props.removeDuplicate(word, this.props.sense.id);
			}
			if (this.props.sense.dups.length <= 1) {
				if (this.props.closePopper) this.props.closePopper();
			}
		}
		this.setState({});
	}
	render() {
		return (
			<Paper>
				{this.props.sense.dups.map((word, index) => (
					<div key={word.id}>
						<div
							style={{height: 20}}
							onDragOver={e => {
								e.preventDefault();
								e.stopPropagation();
							}}
							onDrop={e => this.dragDrop(e, index)}
						/>
						<Card
							draggable={true}
							onDragStart={() => this.drag(word)}
							onDragOver={e => {
								e.preventDefault();
								e.stopPropagation();
							}}
							onDrop={e => this.dragDrop(e, index)}
							onDragEnd={() => this.removeCard(word)}
						>
							<CardContent>
								<WordContent word={word} />
							</CardContent>
						</Card>
					</div>
				))}
			</Paper>
		);
	}
}

export default withLocalize(StackDisplay);
