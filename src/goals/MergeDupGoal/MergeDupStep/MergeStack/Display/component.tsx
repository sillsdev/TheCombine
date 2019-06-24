import { Word } from "../../../../../types/word";
import React from "react";
import { withLocalize, LocalizeContextProps } from "react-localize-redux";
import { Paper, Card, CardContent } from "@material-ui/core";
import WordContent from "../../WordCard";

export interface StackDisplayProps {
	words: Word[],
}

export interface StackDisplayState { }

class StackDisplay extends React.Component<
	StackDisplayProps & LocalizeContextProps,
	StackDisplayState>{

	render() {
		return (
			<Paper>
				{this.props.words.map(word => (
					<Card key={word.id}>
						<CardContent>
							<WordContent word={word} />
						</CardContent>
					</Card>
				))}
			</Paper>
		);
	}
}

export default withLocalize(StackDisplay);
