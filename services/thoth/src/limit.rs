use twilight_model::application::{
    command::CommandOptionType,
    interaction::application_command::{CommandInteractionDataResolved, CommandOptionValue},
};
use vesper::prelude::*;

#[derive(Debug)]
pub struct SearchLimit(pub i8);

#[async_trait]
impl<T: Send + Sync> Parse<T> for SearchLimit {
    async fn parse(
        _http_client: &WrappedClient,
        _data: &T,
        value: Option<&CommandOptionValue>,
        _resolved: Option<&mut CommandInteractionDataResolved>,
    ) -> Result<Self, ParseError> {
        let value = match value {
            Some(value) => value,
            None => return Ok(Self(25)),
        };

        let limit = match value {
            CommandOptionValue::Integer(limit) => limit,
            _ => {
                return Err(ParseError::Parsing {
                    argument_name: "limit".to_string(),
                    argument_type: "integer".to_string(),
                    required: true,
                    error: "Limit provided was not an integer".to_string(),
                })
            }
        };

        if limit < &1 || limit > &50 {
            return Err(ParseError::Parsing {
                argument_name: "limit".to_string(),
                argument_type: "integer".to_string(),
                required: true,
                error: "Limit was less than 1 or greater than 50.".to_string(),
            });
        }

        Ok(Self(*limit as i8))
    }

    fn kind() -> CommandOptionType {
        CommandOptionType::Integer
    }
}
